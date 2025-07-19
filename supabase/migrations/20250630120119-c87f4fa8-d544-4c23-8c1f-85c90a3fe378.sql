
-- Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  national_number TEXT NOT NULL UNIQUE,
  nationality TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create teacher_classes junction table
CREATE TABLE public.teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  hourly_salary DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MRU',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);

-- Enable RLS on teachers table
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on teacher_classes table
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teachers table
CREATE POLICY "School members can view teachers" ON public.teachers
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );

-- Create RLS policies for teacher_classes table
CREATE POLICY "School members can view teacher classes" ON public.teacher_classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = teacher_classes.teacher_id 
      AND t.school_id = ANY(public.get_user_school_ids(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = teacher_classes.teacher_id 
      AND (
        public.user_has_role_in_school(auth.uid(), t.school_id, 'super_admin') OR
        public.user_has_role_in_school(auth.uid(), t.school_id, 'admin')
      )
    )
  );

-- Remove teacher_id from grade_levels table (if it exists)
ALTER TABLE public.grade_levels DROP COLUMN IF EXISTS teacher_id;

-- Add teacher_id to classes table (if it doesn't exist)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL;
