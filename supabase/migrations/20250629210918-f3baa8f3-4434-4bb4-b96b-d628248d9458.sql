
-- Create a table to track student grade history
CREATE TABLE public.student_grade_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL DEFAULT '1',
  academic_year TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_student_grade_history_student_id ON public.student_grade_history(student_id);
CREATE INDEX idx_student_grade_history_grade_id ON public.student_grade_history(grade_id);
CREATE INDEX idx_student_grade_history_academic_year ON public.student_grade_history(academic_year);

-- Add RLS policies for student grade history
ALTER TABLE public.student_grade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view student grade history from their school" 
  ON public.student_grade_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = student_grade_history.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can insert student grade history to their school" 
  ON public.student_grade_history 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = student_grade_history.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can update student grade history from their school" 
  ON public.student_grade_history 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = student_grade_history.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

-- Add group_name column to students table for current group
ALTER TABLE public.students ADD COLUMN group_name TEXT NOT NULL DEFAULT '1';

-- Create a function to automatically create grade history when student grade changes
CREATE OR REPLACE FUNCTION public.create_student_grade_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this is an INSERT or the grade_id has changed
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.grade_id IS DISTINCT FROM NEW.grade_id) THEN
    -- Deactivate previous grade history entries for this student
    UPDATE public.student_grade_history 
    SET is_active = false, updated_at = now()
    WHERE student_id = NEW.id AND is_active = true;
    
    -- Create new grade history entry if grade_id is not null
    IF NEW.grade_id IS NOT NULL THEN
      INSERT INTO public.student_grade_history (
        student_id, 
        grade_id, 
        group_name,
        academic_year, 
        school_id
      ) VALUES (
        NEW.id, 
        NEW.grade_id, 
        NEW.group_name,
        EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)::TEXT,
        NEW.school_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for grade history
CREATE TRIGGER student_grade_history_trigger
  AFTER INSERT OR UPDATE OF grade_id, group_name ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.create_student_grade_history();
