
-- Update student_payments RLS policy to include accountants
DROP POLICY IF EXISTS "Admins can manage student payments" ON public.student_payments;

CREATE POLICY "Admins and accountants can manage student payments" 
  ON public.student_payments 
  FOR ALL 
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR 
    user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role) OR
    user_has_role_in_school(auth.uid(), school_id, 'accountant'::school_role)
  );
