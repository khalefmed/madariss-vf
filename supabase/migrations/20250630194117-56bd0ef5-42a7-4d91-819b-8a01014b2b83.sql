
-- Enable RLS on academic_quarters table
ALTER TABLE public.academic_quarters ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view academic quarters in their school
CREATE POLICY "Users can view academic quarters in their school" 
ON public.academic_quarters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_years ay
    JOIN public.school_users su ON su.school_id = ay.school_id
    WHERE ay.id = academic_quarters.academic_year_id 
    AND su.user_id = auth.uid()
    AND su.is_active = true
  )
);

-- Create policy for admins to insert academic quarters in their school
CREATE POLICY "Admins can create academic quarters in their school" 
ON public.academic_quarters 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.academic_years ay
    JOIN public.school_users su ON su.school_id = ay.school_id
    WHERE ay.id = academic_quarters.academic_year_id 
    AND su.user_id = auth.uid()
    AND su.role = 'admin'
    AND su.is_active = true
  )
);

-- Create policy for admins to update academic quarters in their school
CREATE POLICY "Admins can update academic quarters in their school" 
ON public.academic_quarters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_years ay
    JOIN public.school_users su ON su.school_id = ay.school_id
    WHERE ay.id = academic_quarters.academic_year_id 
    AND su.user_id = auth.uid()
    AND su.role = 'admin'
    AND su.is_active = true
  )
);

-- Create policy for admins to delete academic quarters in their school
CREATE POLICY "Admins can delete academic quarters in their school" 
ON public.academic_quarters 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_years ay
    JOIN public.school_users su ON su.school_id = ay.school_id
    WHERE ay.id = academic_quarters.academic_year_id 
    AND su.user_id = auth.uid()
    AND su.role = 'admin'
    AND su.is_active = true
  )
);
