
-- Update RLS policies to allow academic directors to manage students
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director'::school_role)
  );

-- Update RLS policies to allow academic directors to manage teachers
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director'::school_role)
  );

-- Update RLS policies to allow academic directors to manage classes
DROP POLICY IF EXISTS "Admins and teachers can manage classes" ON public.classes;
CREATE POLICY "Admins and teachers can manage classes" ON public.classes
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'teacher'::school_role)
  );

-- Update RLS policies to allow academic directors to manage teacher classes
DROP POLICY IF EXISTS "Admins can manage teacher classes" ON public.teacher_classes;
CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = teacher_classes.teacher_id 
      AND (
        user_has_role_in_school(auth.uid(), t.school_id, 'super_admin'::school_role) OR
        user_has_role_in_school(auth.uid(), t.school_id, 'admin'::school_role) OR
        user_has_role_in_school(auth.uid(), t.school_id, 'academic_director'::school_role)
      )
    )
  );
