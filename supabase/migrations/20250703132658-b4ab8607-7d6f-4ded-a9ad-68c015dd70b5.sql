
-- Create student_payments table
CREATE TABLE public.student_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  label TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for student payments
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

-- Admins can manage payments in their school
CREATE POLICY "Admins can manage student payments" 
  ON public.student_payments 
  FOR ALL 
  USING (
    user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR 
    user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role)
  );

-- School members can view payments in their school
CREATE POLICY "School members can view student payments" 
  ON public.student_payments 
  FOR SELECT 
  USING (school_id = ANY (get_user_school_ids(auth.uid())));

-- Create index for better performance
CREATE INDEX idx_student_payments_student_id ON public.student_payments(student_id);
CREATE INDEX idx_student_payments_school_id ON public.student_payments(school_id);
CREATE INDEX idx_student_payments_date ON public.student_payments(payment_date DESC);
