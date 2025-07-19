
-- Update the schedules RLS policy to allow students to see schedules for their grade
DROP POLICY IF EXISTS "School members can view relevant schedules" ON public.schedules;

CREATE POLICY "School members can view relevant schedules" ON public.schedules
  FOR SELECT
  USING (
    -- Admins and academic directors can see all schedules in their school
    user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director') OR
    -- Teachers can see schedules for classes they are assigned to
    (class_id IS NOT NULL AND user_is_teacher_for_class(auth.uid(), class_id)) OR
    -- Students can see schedules for their grade
    (grade_id IN (
      SELECT s.grade_id 
      FROM students s 
      WHERE s.user_id = auth.uid() AND s.is_active = true
    )) OR
    -- All school members can see general schedule structure (empty slots)
    (class_id IS NULL AND school_id = ANY(get_user_school_ids(auth.uid())))
  );
