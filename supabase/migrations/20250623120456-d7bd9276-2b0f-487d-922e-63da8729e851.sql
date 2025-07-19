
-- Update RLS policies for schools table to allow super admins to insert schools
CREATE POLICY "Super admins can insert schools" ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
    OR
    NOT EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid()
    )
  );

-- Also update the existing policy to allow super admins to view all schools
DROP POLICY IF EXISTS "Users can view schools they belong to" ON public.schools;
CREATE POLICY "Users can view schools they belong to" ON public.schools
  FOR SELECT
  USING (
    id = ANY(public.get_user_school_ids(auth.uid()))
    OR
    EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Update school_users policies to allow super admins to manage all school users
DROP POLICY IF EXISTS "Admins can manage school users" ON public.school_users;
CREATE POLICY "Admins can manage school users" ON public.school_users
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Add a policy for inserting into school_users
CREATE POLICY "Super admins can insert school users" ON public.school_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );
