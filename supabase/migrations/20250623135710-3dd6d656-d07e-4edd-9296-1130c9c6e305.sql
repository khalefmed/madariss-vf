
-- Create a junction table for student-class enrollments
CREATE TABLE public.student_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(student_id, class_id)
);

-- Enable RLS on the junction table
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_classes table
CREATE POLICY "Users can view student classes from their school" 
  ON public.student_classes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      JOIN public.school_users su ON s.school_id = su.school_id
      WHERE s.id = student_classes.student_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can insert student classes from their school" 
  ON public.student_classes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s 
      JOIN public.school_users su ON s.school_id = su.school_id
      WHERE s.id = student_classes.student_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can update student classes from their school" 
  ON public.student_classes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      JOIN public.school_users su ON s.school_id = su.school_id
      WHERE s.id = student_classes.student_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can delete student classes from their school" 
  ON public.student_classes 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      JOIN public.school_users su ON s.school_id = su.school_id
      WHERE s.id = student_classes.student_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

-- Create a function to generate the next student ID
CREATE OR REPLACE FUNCTION public.generate_student_id(school_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number integer;
  new_student_id text;
BEGIN
  -- Get the highest existing student number for this school
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(student_id FROM 4) AS integer)), 
    0
  ) + 1
  INTO next_number
  FROM public.students
  WHERE school_id = school_uuid
  AND student_id ~ '^STU[0-9]+$';
  
  -- Format the new student ID with leading zeros
  new_student_id := 'STU' || LPAD(next_number::text, 3, '0');
  
  RETURN new_student_id;
END;
$$;

-- Create a function to automatically enroll student in grade-level classes
CREATE OR REPLACE FUNCTION public.auto_enroll_student_in_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the student has a grade level (from class_id), enroll them in all classes of that grade
  IF NEW.class_id IS NOT NULL THEN
    INSERT INTO public.student_classes (student_id, class_id)
    SELECT NEW.id, c.id
    FROM public.classes c
    JOIN public.classes student_class ON student_class.id = NEW.class_id
    WHERE c.school_id = NEW.school_id
    AND c.grade_level = student_class.grade_level
    AND c.is_active = true
    ON CONFLICT (student_id, class_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-enroll students when they are created or updated
CREATE TRIGGER auto_enroll_student_trigger
  AFTER INSERT OR UPDATE OF class_id ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enroll_student_in_classes();
