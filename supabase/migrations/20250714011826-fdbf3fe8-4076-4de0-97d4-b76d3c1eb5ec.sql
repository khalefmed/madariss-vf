-- Update the generate_student_id function to create global sequential IDs
CREATE OR REPLACE FUNCTION public.generate_student_id(school_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  next_number integer;
  new_student_id text;
BEGIN
  -- Get the highest existing student number globally (across all schools)
  SELECT COALESCE(
    MAX(CAST(student_id AS integer)), 
    10000
  ) + 1
  INTO next_number
  FROM public.students
  WHERE student_id ~ '^[0-9]+$';
  
  -- Return the new student ID as a 5-digit number
  new_student_id := LPAD(next_number::text, 5, '0');
  
  RETURN new_student_id;
END;
$function$