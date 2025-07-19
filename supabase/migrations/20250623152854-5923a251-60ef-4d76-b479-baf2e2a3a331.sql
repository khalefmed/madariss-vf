
-- Add new columns to the students table
ALTER TABLE public.students 
ADD COLUMN national_id TEXT,
ADD COLUMN sex TEXT CHECK (sex IN ('male', 'female'));

-- Clear existing students to start fresh
DELETE FROM public.student_classes;
DELETE FROM public.students;
