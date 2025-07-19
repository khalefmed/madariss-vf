import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type StudentAllMarks = {
  id: string;
  class_id: string;
  academic_quarter_id: string;
  mark_type: 'assessment' | 'exam';
  mark: number | null;
  max_mark: number;
  entered_at: string | null;
  classes: {
    id: string;
    name: string;
    coefficient: number | null;
  };
  academic_quarters: {
    id: string;
    name: string;
    quarter: 'Q1' | 'Q2' | 'Q3';
  };
};

export function useStudentAllMarks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-all-marks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching all marks for student user:', user.id);

      // First get the student record for this user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student record:', studentError);
        throw studentError;
      }

      if (!studentData) {
        console.log('No student record found for user:', user.id);
        return [];
      }

      console.log('Found student record:', studentData.id);

      // Then get all their marks
      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          classes!inner(
            id,
            name,
            coefficient
          ),
          academic_quarters!inner(
            id,
            name,
            quarter
          )
        `)
        .eq('student_id', studentData.id)
        .order('academic_quarters(quarter)', { ascending: true })
        .order('classes(name)', { ascending: true });

      if (error) {
        console.error('Error fetching student all marks:', error);
        throw error;
      }

      console.log('Student all marks data:', data);
      return data as StudentAllMarks[];
    },
    enabled: !!user
  });
}