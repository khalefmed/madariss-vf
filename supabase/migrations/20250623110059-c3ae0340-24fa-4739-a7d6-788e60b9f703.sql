
-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'premium', 'enterprise');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due');

-- Create enum for user roles within schools
CREATE TYPE public.school_role AS ENUM ('super_admin', 'admin', 'teacher', 'student', 'parent');

-- Create schools table (tenants)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'basic',
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create school_users table (many-to-many relationship between users and schools)
CREATE TABLE public.school_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role school_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  section TEXT,
  teacher_id UUID REFERENCES auth.users(id),
  academic_year TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  class_id UUID REFERENCES public.classes(id),
  enrollment_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(school_id, student_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assignment_name TEXT NOT NULL,
  grade DECIMAL(5,2),
  max_grade DECIMAL(5,2) NOT NULL DEFAULT 100,
  date_assigned DATE DEFAULT CURRENT_DATE,
  date_due DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Create function to get user's school IDs
CREATE OR REPLACE FUNCTION public.get_user_school_ids(user_uuid UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(school_id)
  FROM public.school_users
  WHERE user_id = user_uuid AND is_active = true;
$$;

-- Create function to check if user has role in school
CREATE OR REPLACE FUNCTION public.user_has_role_in_school(user_uuid UUID, school_uuid UUID, required_role school_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_users
    WHERE user_id = user_uuid 
      AND school_id = school_uuid 
      AND role = required_role
      AND is_active = true
  );
$$;

-- RLS Policies for schools table
CREATE POLICY "Users can view schools they belong to" ON public.schools
  FOR SELECT
  USING (id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Super admins can update their schools" ON public.schools
  FOR UPDATE
  USING (public.user_has_role_in_school(auth.uid(), id, 'super_admin'));

-- RLS Policies for school_users table
CREATE POLICY "Users can view school memberships they belong to" ON public.school_users
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins can manage school users" ON public.school_users
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );

-- RLS Policies for profiles table
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL
  USING (id = auth.uid());

-- RLS Policies for classes table
CREATE POLICY "School members can view classes" ON public.classes
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins and teachers can manage classes" ON public.classes
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'teacher')
  );

-- RLS Policies for students table
CREATE POLICY "School members can view students" ON public.students
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );

-- RLS Policies for attendance table
CREATE POLICY "School members can view attendance" ON public.attendance
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Teachers and admins can manage attendance" ON public.attendance
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'teacher')
  );

-- RLS Policies for subjects table
CREATE POLICY "School members can view subjects" ON public.subjects
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );

-- RLS Policies for grades table
CREATE POLICY "School members can view grades" ON public.grades
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Teachers and admins can manage grades" ON public.grades
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'teacher')
  );

-- Create trigger function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to handle new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data for testing
INSERT INTO public.schools (name, slug, email, subscription_tier, subscription_status) VALUES
('Greenwood High School', 'greenwood-high', 'admin@greenwood.edu', 'premium', 'active'),
('Oak Valley Elementary', 'oak-valley-elem', 'admin@oakvalley.edu', 'basic', 'active');
