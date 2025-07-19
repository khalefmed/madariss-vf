
-- First, let's check if we have any teacher records and create some sample data
-- We'll use your existing user ID from the logs: f2c940e3-cf68-4982-8f96-c8a28abd5410

-- Insert a teacher record for the current user
INSERT INTO public.teachers (
  user_id,
  name,
  national_number,
  email,
  phone,
  nationality,
  school_id,
  is_active
) VALUES (
  'f2c940e3-cf68-4982-8f96-c8a28abd5410',
  'Sample Teacher',
  'TCH001',
  'teacher@example.com',
  '+1234567890',
  'Sample Nationality',
  '6cd03fcc-4a0a-48f8-bade-2c88844d368d', -- Using the school_id from your logs
  true
);

-- Create some sample classes if they don't exist
INSERT INTO public.classes (
  name,
  school_id,
  grade_id,
  coefficient,
  is_active
) VALUES 
  ('Mathematics', '6cd03fcc-4a0a-48f8-bade-2c88844d368d', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1), 
   2.0, true),
  ('Science', '6cd03fcc-4a0a-48f8-bade-2c88844d368d', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1), 
   1.5, true),
  ('English', '6cd03fcc-4a0a-48f8-bade-2c88844d368d', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1), 
   1.0, true)
ON CONFLICT DO NOTHING;

-- Assign the teacher to these classes
INSERT INTO public.teacher_classes (
  teacher_id,
  class_id,
  hourly_salary,
  currency,
  is_active
)
SELECT 
  t.id,
  c.id,
  50.0,
  'MRU',
  true
FROM public.teachers t
CROSS JOIN public.classes c
WHERE t.user_id = 'f2c940e3-cf68-4982-8f96-c8a28abd5410'
  AND c.school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d'
ON CONFLICT DO NOTHING;

-- Create some sample students for testing
INSERT INTO public.students (
  student_id,
  first_name,
  last_name,
  email,
  grade_id,
  school_id,
  group_name,
  is_active
) VALUES 
  ('STU001', 'John', 'Doe', 'john.doe@example.com', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1),
   '6cd03fcc-4a0a-48f8-bade-2c88844d368d', '1', true),
  ('STU002', 'Jane', 'Smith', 'jane.smith@example.com', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1),
   '6cd03fcc-4a0a-48f8-bade-2c88844d368d', '1', true),
  ('STU003', 'Bob', 'Johnson', 'bob.johnson@example.com', 
   (SELECT id FROM public.grade_levels WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' LIMIT 1),
   '6cd03fcc-4a0a-48f8-bade-2c88844d368d', '1', true)
ON CONFLICT DO NOTHING;
