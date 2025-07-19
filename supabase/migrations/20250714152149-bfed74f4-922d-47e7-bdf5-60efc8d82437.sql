
-- Add academic_year_id column to student_payments table
ALTER TABLE public.student_payments 
ADD COLUMN academic_year_id UUID REFERENCES public.academic_years(id);

-- Update the RLS policy to include academic year access
DROP POLICY IF EXISTS "School members can view student payments" ON public.student_payments;
CREATE POLICY "School members can view student payments" 
ON public.student_payments 
FOR SELECT 
USING (school_id = ANY (get_user_school_ids(auth.uid())));
