
-- First, let's check the current structure and create the proper grade_levels table
-- Since the previous grades table might have different columns, let's create it properly

-- Drop the incorrectly renamed table if it exists
DROP TABLE IF EXISTS public.grade_levels CASCADE;

-- Create the proper grade_levels table
CREATE TABLE public.grade_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on grade_levels
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for grade_levels
CREATE POLICY "Users can view grade levels from their school" 
  ON public.grade_levels 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = grade_levels.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can insert grade levels to their school" 
  ON public.grade_levels 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = grade_levels.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

CREATE POLICY "Users can update grade levels from their school" 
  ON public.grade_levels 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.school_users su 
      WHERE su.school_id = grade_levels.school_id 
      AND su.user_id = auth.uid() 
      AND su.is_active = true
    )
  );

-- Add the grade_id column to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.grade_levels(id) ON DELETE SET NULL;

-- Update the auto-enrollment function
CREATE OR REPLACE FUNCTION public.auto_enroll_student_in_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the student has a class_id, enroll them in all classes of that grade
  IF NEW.class_id IS NOT NULL THEN
    INSERT INTO public.student_classes (student_id, class_id)
    SELECT NEW.id, c.id
    FROM public.classes c
    JOIN public.classes student_class ON student_class.id = NEW.class_id
    WHERE c.school_id = NEW.school_id
    AND c.grade_id = student_class.grade_id
    AND c.is_active = true
    ON CONFLICT (student_id, class_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
