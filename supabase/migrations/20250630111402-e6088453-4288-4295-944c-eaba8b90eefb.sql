
-- Add coefficient column to classes table
ALTER TABLE public.classes ADD COLUMN coefficient DECIMAL(3,2) DEFAULT 1.0;

-- Remove section column from classes table
ALTER TABLE public.classes DROP COLUMN section;

-- Add academic_year_id to classes table to link directly to academic years
ALTER TABLE public.classes ADD COLUMN academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;

-- Remove the old academic_year text field since we now have proper relation
ALTER TABLE public.classes DROP COLUMN academic_year;
