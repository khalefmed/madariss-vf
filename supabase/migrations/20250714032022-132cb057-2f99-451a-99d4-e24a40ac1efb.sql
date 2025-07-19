
-- Update the RLS policy for schools table to allow system super admins to update any school
DROP POLICY IF EXISTS "Super admins can update their schools" ON public.schools;

CREATE POLICY "Super admins can update schools" ON public.schools
  FOR UPDATE
  USING (
    -- System super admins (have super_admin role in any school) can update any school
    public.is_super_admin(auth.uid()) OR
    -- Regular super admins can only update schools they have super_admin role for
    user_has_role_in_school(auth.uid(), id, 'super_admin'::school_role)
  );
