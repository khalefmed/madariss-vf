
-- Update attendance RLS policies to include academic directors and supervisors

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Teachers and admins can manage attendance" ON public.attendance;

-- Create new comprehensive policy that includes academic directors and supervisors
CREATE POLICY "Admins, teachers, academic directors and supervisors can manage attendance" ON public.attendance
  FOR ALL
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    user_has_role_in_school(auth.uid(), school_id, 'teacher') OR
    user_has_role_in_school(auth.uid(), school_id, 'academic_director') OR
    user_has_role_in_school(auth.uid(), school_id, 'supervisor')
  );
