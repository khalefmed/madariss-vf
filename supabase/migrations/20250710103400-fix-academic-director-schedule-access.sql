
-- Update schedules RLS policies to properly include academic directors

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;

-- Create comprehensive policy for schedule management that includes academic directors
CREATE POLICY "Admins and academic directors can manage schedules" ON public.schedules
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director')
  );

-- Update the view policy to ensure academic directors can see all schedules in their school
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
    -- All school members can see general schedule structure (empty slots)
    (class_id IS NULL AND school_id = ANY(get_user_school_ids(auth.uid())))
  );
