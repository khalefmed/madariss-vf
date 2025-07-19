
-- Add pricing and balance columns to grade_levels table
ALTER TABLE public.grade_levels 
ADD COLUMN monthly_price NUMERIC DEFAULT 0,
ADD COLUMN currency TEXT DEFAULT 'MRU';

-- Add balance and discount columns to students table
ALTER TABLE public.students 
ADD COLUMN balance NUMERIC DEFAULT 0,
ADD COLUMN discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Create a table to track monthly debits
CREATE TABLE public.student_monthly_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  grade_id UUID REFERENCES public.grade_levels(id) NOT NULL,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  charge_month DATE NOT NULL, -- First day of the month being charged
  original_amount NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, charge_month)
);

-- Enable RLS on student_monthly_charges
ALTER TABLE public.student_monthly_charges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_monthly_charges
CREATE POLICY "School members can view student monthly charges"
ON public.student_monthly_charges
FOR SELECT
USING (school_id = ANY (get_user_school_ids(auth.uid())));

CREATE POLICY "Admins and accountants can manage student monthly charges"
ON public.student_monthly_charges
FOR ALL
USING (
  user_has_role_in_school(auth.uid(), school_id, 'super_admin'::school_role) OR
  user_has_role_in_school(auth.uid(), school_id, 'admin'::school_role) OR
  user_has_role_in_school(auth.uid(), school_id, 'accountant'::school_role)
);

-- Create a function to process monthly charges for all students
CREATE OR REPLACE FUNCTION public.process_monthly_charges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record RECORD;
  charge_month DATE;
  original_amount NUMERIC;
  discount_amount NUMERIC;
  final_amount NUMERIC;
BEGIN
  -- Get the first day of current month
  charge_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Process each active student with a grade
  FOR student_record IN 
    SELECT s.id, s.school_id, s.grade_id, s.discount_percentage, s.balance,
           gl.monthly_price
    FROM public.students s
    JOIN public.grade_levels gl ON gl.id = s.grade_id
    WHERE s.is_active = true 
    AND s.grade_id IS NOT NULL
    AND gl.monthly_price > 0
  LOOP
    -- Skip if already charged this month
    IF EXISTS (
      SELECT 1 FROM public.student_monthly_charges 
      WHERE student_id = student_record.id 
      AND charge_month = charge_month
    ) THEN
      CONTINUE;
    END IF;
    
    -- Calculate amounts
    original_amount := student_record.monthly_price;
    discount_amount := original_amount * (student_record.discount_percentage / 100);
    final_amount := original_amount - discount_amount;
    
    -- Create charge record
    INSERT INTO public.student_monthly_charges (
      student_id, grade_id, school_id, charge_month,
      original_amount, discount_percentage, final_amount
    ) VALUES (
      student_record.id, student_record.grade_id, student_record.school_id,
      charge_month, original_amount, student_record.discount_percentage, final_amount
    );
    
    -- Debit student balance
    UPDATE public.students 
    SET balance = balance - final_amount,
        updated_at = now()
    WHERE id = student_record.id;
    
    -- Mark charge as completed
    UPDATE public.student_monthly_charges
    SET status = 'completed', processed_at = now()
    WHERE student_id = student_record.id AND charge_month = charge_month;
    
  END LOOP;
END;
$$;

-- Create a trigger to automatically credit balance when payments are made
CREATE OR REPLACE FUNCTION public.credit_student_balance_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Credit the student's balance with the payment amount
  UPDATE public.students 
  SET balance = balance + NEW.amount,
      updated_at = now()
  WHERE id = NEW.student_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment insertions
CREATE TRIGGER credit_balance_on_payment
  AFTER INSERT ON public.student_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_student_balance_on_payment();
