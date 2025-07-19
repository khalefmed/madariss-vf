
-- Add grade_id column to students table to directly link student to grade
ALTER TABLE public.students 
ADD COLUMN grade_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL;

-- Create an index for better performance on grade lookups
CREATE INDEX idx_students_grade_id ON public.students(grade_id);

-- Update the auto-enrollment function to work with the new grade_id column
CREATE OR REPLACE FUNCTION public.auto_enroll_student_in_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the student has a grade_id, enroll them in all active classes of that grade
  IF NEW.grade_id IS NOT NULL THEN
    INSERT INTO public.student_classes (student_id, class_id)
    SELECT NEW.id, c.id
    FROM public.classes c
    WHERE c.school_id = NEW.school_id
    AND c.grade_id = NEW.grade_id
    AND c.is_active = true
    ON CONFLICT (student_id, class_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the trigger to work with grade_id instead of class_id
DROP TRIGGER IF EXISTS auto_enroll_student_trigger ON public.students;
CREATE TRIGGER auto_enroll_student_trigger
  AFTER INSERT OR UPDATE OF grade_id ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enroll_student_in_classes();
