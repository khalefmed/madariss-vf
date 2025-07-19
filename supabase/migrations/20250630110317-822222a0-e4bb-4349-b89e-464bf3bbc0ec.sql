
-- Create academic_years table (fixed version)
CREATE TABLE public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  year_name TEXT NOT NULL, -- e.g., "2024-2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_year_per_school UNIQUE (school_id, year_name)
);

-- Add RLS policies for academic_years
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view academic years from their school" 
  ON public.academic_years 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = academic_years.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can manage academic years in their school" 
  ON public.academic_years 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = academic_years.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

-- Add academic_year_id to student_grade_history
ALTER TABLE public.student_grade_history ADD COLUMN academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE;

-- Update the trigger function to remove group_name references
CREATE OR REPLACE FUNCTION public.create_student_grade_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_academic_year_id UUID;
BEGIN
  -- If this is an INSERT or the grade_id has changed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.grade_id IS DISTINCT FROM NEW.grade_id) THEN
    -- Get current academic year for the school
    SELECT id INTO current_academic_year_id
    FROM public.academic_years 
    WHERE school_id = NEW.school_id AND is_current = true
    LIMIT 1;
    
    -- Only proceed if there's a current academic year
    IF current_academic_year_id IS NOT NULL THEN
      -- Deactivate previous grade history entries for this student
      UPDATE public.student_grade_history 
      SET is_active = false, updated_at = now()
      WHERE student_id = NEW.id AND is_active = true;
      
      -- Create new grade history entry if grade_id is not null
      IF NEW.grade_id IS NOT NULL THEN
        INSERT INTO public.student_grade_history (
          student_id, 
          grade_id, 
          academic_year_id,
          academic_year,
          school_id
        ) VALUES (
          NEW.id, 
          NEW.grade_id, 
          current_academic_year_id,
          (SELECT year_name FROM public.academic_years WHERE id = current_academic_year_id),
          NEW.school_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add validation constraint for national_id (10 digits)
ALTER TABLE public.students ADD CONSTRAINT check_national_id_format CHECK (national_id ~ '^\d{10}$');
