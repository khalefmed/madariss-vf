
-- Fix the schedules RLS policies to allow proper access for different user roles

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Only admins can manage schedules" ON public.schedules;

-- Restore proper view access for all school members with appropriate scope
CREATE POLICY "School members can view relevant schedules" ON public.schedules
  FOR SELECT
  USING (
    -- Admins can see all schedules in their school
    user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    -- Teachers can see schedules for classes they are assigned to
    (class_id IS NOT NULL AND user_is_teacher_for_class(auth.uid(), class_id)) OR
    -- All school members can see general schedule structure (empty slots)
    (class_id IS NULL AND school_id = ANY(get_user_school_ids(auth.uid())))
  );

-- Keep admin-only management policy
CREATE POLICY "Admins can manage schedules" ON public.schedules
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'admin')
  );
