
-- Create schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('8h-10h', '10h-12h', '12h-14h')),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grade_id, day_of_week, time_slot, academic_year_id)
);

-- Enable RLS on schedules table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schedules table
CREATE POLICY "School members can view schedules" ON public.schedules
  FOR SELECT
  USING (school_id = ANY(public.get_user_school_ids(auth.uid())));

CREATE POLICY "Admins can manage schedules" ON public.schedules
  FOR ALL
  USING (
    public.user_has_role_in_school(auth.uid(), school_id, 'super_admin') OR
    public.user_has_role_in_school(auth.uid(), school_id, 'admin')
  );
