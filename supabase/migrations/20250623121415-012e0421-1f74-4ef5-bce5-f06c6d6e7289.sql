
-- Create a security definer function to check if user has super_admin role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_users
    WHERE user_id = user_uuid 
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- Drop and recreate the problematic policies using the security definer function
DROP POLICY IF EXISTS "Super admins can insert schools" ON public.schools;
CREATE POLICY "Super admins can insert schools" ON public.schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_super_admin(auth.uid()) OR
    NOT EXISTS (
      SELECT 1 FROM public.school_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view schools they belong to" ON public.schools;
CREATE POLICY "Users can view schools they belong to" ON public.schools
  FOR SELECT
  USING (
    id = ANY(public.get_user_school_ids(auth.uid())) OR
    public.is_super_admin(auth.uid())
  );

-- Fix the school_users policies to prevent recursion
DROP POLICY IF EXISTS "Admins can manage school users" ON public.school_users;
CREATE POLICY "School admins can manage school users" ON public.school_users
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Super admins can insert school users" ON public.school_users;
CREATE POLICY "Can insert school users" ON public.school_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.user_has_role_in_school(auth.uid(), school_id, 'admin') OR
    public.is_super_admin(auth.uid())
  );

-- Add a simple policy for users to view their own school memberships
CREATE POLICY "Users can view own school memberships" ON public.school_users
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
