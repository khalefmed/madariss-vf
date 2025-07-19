
-- Create enum for academic quarters
CREATE TYPE public.academic_quarter AS ENUM ('Q1', 'Q2', 'Q3');

-- Create enum for mark types
CREATE TYPE public.mark_type AS ENUM ('assessment', 'exam');

-- Create academic_quarters table to track which quarter is currently active
CREATE TABLE public.academic_quarters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  quarter public.academic_quarter NOT NULL,
  name TEXT NOT NULL, -- e.g., "First Quarter 2024-2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(academic_year_id, quarter)
);

-- Create student_marks table to store individual marks
CREATE TABLE public.student_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_quarter_id UUID NOT NULL REFERENCES public.academic_quarters(id) ON DELETE CASCADE,
  mark_type public.mark_type NOT NULL,
  mark NUMERIC(5,2) CHECK (mark >= 0 AND mark <= 20), -- Mauritanian system uses /20
  max_mark NUMERIC(5,2) NOT NULL DEFAULT 20,
  teacher_id UUID REFERENCES public.teachers(id),
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  UNIQUE(student_id, class_id, academic_quarter_id, mark_type)
);

-- Create student_quarter_averages table to store calculated averages per quarter
CREATE TABLE public.student_quarter_averages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_quarter_id UUID NOT NULL REFERENCES public.academic_quarters(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES public.grade_levels(id),
  assessment_average NUMERIC(5,2), -- Weighted average of all assessments in the quarter
  exam_average NUMERIC(5,2), -- Weighted average of all exams in the quarter
  quarter_average NUMERIC(5,2), -- Combined average of assessment and exam
  total_coefficient NUMERIC(8,2), -- Sum of all coefficients for classes in this grade
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  UNIQUE(student_id, academic_quarter_id)
);

-- Create student_yearly_averages table to store final yearly calculations
CREATE TABLE public.student_yearly_averages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES public.grade_levels(id),
  assessment_yearly_average NUMERIC(5,2), -- Average of Q1, Q2, Q3 assessment averages
  exam_yearly_average NUMERIC(5,2), -- Average of Q1, Q2, Q3 exam averages
  final_yearly_average NUMERIC(5,2), -- Final combined average
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  UNIQUE(student_id, academic_year_id)
);

-- Add indexes for better performance
CREATE INDEX idx_student_marks_student_quarter ON public.student_marks(student_id, academic_quarter_id);
CREATE INDEX idx_student_marks_class_quarter ON public.student_marks(class_id, academic_quarter_id);
CREATE INDEX idx_student_marks_teacher ON public.student_marks(teacher_id);
CREATE INDEX idx_academic_quarters_active ON public.academic_quarters(academic_year_id, is_active);
CREATE INDEX idx_student_quarter_averages_student ON public.student_quarter_averages(student_id);
CREATE INDEX idx_student_yearly_averages_student ON public.student_yearly_averages(student_id);

-- Function to calculate quarter averages for a student
CREATE OR REPLACE FUNCTION public.calculate_student_quarter_average(
  p_student_id UUID,
  p_quarter_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_grade_id UUID;
  v_school_id UUID;
  v_assessment_total NUMERIC := 0;
  v_exam_total NUMERIC := 0;
  v_total_coefficient NUMERIC := 0;
  v_assessment_avg NUMERIC;
  v_exam_avg NUMERIC;
  v_quarter_avg NUMERIC;
BEGIN
  -- Get student's grade and school
  SELECT grade_id, school_id INTO v_grade_id, v_school_id
  FROM public.students 
  WHERE id = p_student_id;
  
  -- Calculate weighted totals for assessments
  SELECT 
    COALESCE(SUM(sm.mark * c.coefficient), 0),
    COALESCE(SUM(c.coefficient), 0)
  INTO v_assessment_total, v_total_coefficient
  FROM public.student_marks sm
  JOIN public.classes c ON c.id = sm.class_id
  WHERE sm.student_id = p_student_id 
    AND sm.academic_quarter_id = p_quarter_id
    AND sm.mark_type = 'assessment'
    AND c.grade_id = v_grade_id
    AND c.is_active = true;
    
  -- Calculate weighted totals for exams  
  SELECT COALESCE(SUM(sm.mark * c.coefficient), 0)
  INTO v_exam_total
  FROM public.student_marks sm
  JOIN public.classes c ON c.id = sm.class_id
  WHERE sm.student_id = p_student_id 
    AND sm.academic_quarter_id = p_quarter_id
    AND sm.mark_type = 'exam'
    AND c.grade_id = v_grade_id
    AND c.is_active = true;
  
  -- Calculate averages
  IF v_total_coefficient > 0 THEN
    v_assessment_avg := v_assessment_total / v_total_coefficient;
    v_exam_avg := v_exam_total / v_total_coefficient;
    v_quarter_avg := (v_assessment_avg + v_exam_avg) / 2;
  END IF;
  
  -- Insert or update quarter averages
  INSERT INTO public.student_quarter_averages (
    student_id, academic_quarter_id, grade_id, 
    assessment_average, exam_average, quarter_average, 
    total_coefficient, school_id
  )
  VALUES (
    p_student_id, p_quarter_id, v_grade_id,
    v_assessment_avg, v_exam_avg, v_quarter_avg,
    v_total_coefficient, v_school_id
  )
  ON CONFLICT (student_id, academic_quarter_id)
  DO UPDATE SET
    assessment_average = EXCLUDED.assessment_average,
    exam_average = EXCLUDED.exam_average,
    quarter_average = EXCLUDED.quarter_average,
    total_coefficient = EXCLUDED.total_coefficient,
    updated_at = now();
END;
$$;

-- Function to calculate yearly averages for a student
CREATE OR REPLACE FUNCTION public.calculate_student_yearly_average(
  p_student_id UUID,
  p_academic_year_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_grade_id UUID;
  v_school_id UUID;
  v_assessment_yearly NUMERIC;
  v_exam_yearly NUMERIC;
  v_final_yearly NUMERIC;
BEGIN
  -- Get student's grade and school
  SELECT grade_id, school_id INTO v_grade_id, v_school_id
  FROM public.students 
  WHERE id = p_student_id;
  
  -- Calculate yearly averages from quarter averages
  SELECT 
    AVG(sqa.assessment_average),
    AVG(sqa.exam_average)
  INTO v_assessment_yearly, v_exam_yearly
  FROM public.student_quarter_averages sqa
  JOIN public.academic_quarters aq ON aq.id = sqa.academic_quarter_id
  WHERE sqa.student_id = p_student_id 
    AND aq.academic_year_id = p_academic_year_id
    AND sqa.assessment_average IS NOT NULL
    AND sqa.exam_average IS NOT NULL;
    
  -- Calculate final yearly average
  IF v_assessment_yearly IS NOT NULL AND v_exam_yearly IS NOT NULL THEN
    v_final_yearly := (v_assessment_yearly + v_exam_yearly) / 2;
  END IF;
  
  -- Insert or update yearly averages
  INSERT INTO public.student_yearly_averages (
    student_id, academic_year_id, grade_id,
    assessment_yearly_average, exam_yearly_average, final_yearly_average,
    school_id
  )
  VALUES (
    p_student_id, p_academic_year_id, v_grade_id,
    v_assessment_yearly, v_exam_yearly, v_final_yearly,
    v_school_id
  )
  ON CONFLICT (student_id, academic_year_id)
  DO UPDATE SET
    assessment_yearly_average = EXCLUDED.assessment_yearly_average,
    exam_yearly_average = EXCLUDED.exam_yearly_average,
    final_yearly_average = EXCLUDED.final_yearly_average,
    updated_at = now();
END;
$$;

-- Trigger to automatically recalculate averages when marks are inserted/updated
CREATE OR REPLACE FUNCTION public.recalculate_averages_on_mark_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_academic_year_id UUID;
BEGIN
  -- Get academic year from quarter
  SELECT aq.academic_year_id INTO v_academic_year_id
  FROM public.academic_quarters aq
  WHERE aq.id = NEW.academic_quarter_id;
  
  -- Recalculate quarter average
  PERFORM public.calculate_student_quarter_average(NEW.student_id, NEW.academic_quarter_id);
  
  -- Recalculate yearly average
  PERFORM public.calculate_student_yearly_average(NEW.student_id, v_academic_year_id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic recalculation
CREATE TRIGGER trigger_recalculate_averages
  AFTER INSERT OR UPDATE ON public.student_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_averages_on_mark_change();

-- Enable RLS on new tables
ALTER TABLE public.academic_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_quarter_averages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_yearly_averages ENABLE ROW LEVEL SECURITY;

-- RLS policies for academic_quarters
CREATE POLICY "Users can view quarters for their school" ON public.academic_quarters
  FOR SELECT USING (
    academic_year_id IN (
      SELECT ay.id FROM public.academic_years ay
      JOIN public.school_users su ON su.school_id = ay.school_id
      WHERE su.user_id = auth.uid() AND su.is_active = true
    )
  );

-- RLS policies for student_marks
CREATE POLICY "Users can view marks for their school" ON public.student_marks
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.school_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Teachers can insert marks for their classes" ON public.student_marks
  FOR INSERT WITH CHECK (
    teacher_id IN (
      SELECT t.id FROM public.teachers t
      JOIN public.school_users su ON su.user_id = t.user_id
      WHERE su.user_id = auth.uid() AND su.is_active = true
    )
    AND school_id IN (
      SELECT school_id FROM public.school_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Teachers can update marks for their classes" ON public.student_marks
  FOR UPDATE USING (
    teacher_id IN (
      SELECT t.id FROM public.teachers t
      JOIN public.school_users su ON su.user_id = t.user_id
      WHERE su.user_id = auth.uid() AND su.is_active = true
    )
  );

-- RLS policies for averages tables
CREATE POLICY "Users can view quarter averages for their school" ON public.student_quarter_averages
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.school_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view yearly averages for their school" ON public.student_yearly_averages
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.school_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
