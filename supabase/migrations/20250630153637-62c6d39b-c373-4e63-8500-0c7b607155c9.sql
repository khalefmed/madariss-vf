
-- First, add the user_id column to the teachers table
ALTER TABLE public.teachers ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);

-- Now create the helper function to check if a user is a teacher assigned to a specific class
CREATE OR REPLACE FUNCTION public.user_is_teacher_for_class(user_uuid uuid, class_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_users su
    JOIN public.teachers t ON t.user_id = su.user_id
    JOIN public.teacher_classes tc ON tc.teacher_id = t.id
    WHERE su.user_id = user_uuid 
      AND tc.class_id = class_uuid
      AND su.role = 'teacher'
      AND su.is_active = true
      AND tc.is_active = true
  );
$$;

-- Add RLS policy for teachers to view only their assigned class schedules
CREATE POLICY "Teachers can view schedules for their assigned classes" ON public.schedules
  FOR SELECT
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    (class_id IS NOT NULL AND public.user_is_teacher_for_class(auth.uid(), class_id))
  );

-- Update the existing policy to be more specific for admins only
DROP POLICY IF EXISTS "School members can view schedules" ON public.schedules;

-- Teachers should not be able to create/update/delete schedules - only admins
CREATE POLICY "Only admins can manage schedules" ON public.schedules
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );
