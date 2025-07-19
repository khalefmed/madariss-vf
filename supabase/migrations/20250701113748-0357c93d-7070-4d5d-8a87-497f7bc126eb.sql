
-- Ensure we have an active academic quarter for testing
-- First, let's create an academic year if it doesn't exist
INSERT INTO public.academic_years (
  year_name,
  school_id,
  start_date,
  end_date,
  is_current,
  is_active
) VALUES (
  '2024-2025',
  '6cd03fcc-4a0a-48f8-bade-2c88844d368d',
  '2024-09-01',
  '2025-06-30',
  true,
  true
) ON CONFLICT DO NOTHING;

-- Now create an active academic quarter
INSERT INTO public.academic_quarters (
  academic_year_id,
  quarter,
  name,
  start_date,
  end_date,
  is_active,
  is_completed
) VALUES (
  (SELECT id FROM public.academic_years WHERE school_id = '6cd03fcc-4a0a-48f8-bade-2c88844d368d' AND is_current = true LIMIT 1),
  'Q1',
  'First Quarter 2024-2025',
  '2024-09-01',
  '2024-12-15',
  true,
  false
) ON CONFLICT DO NOTHING;
