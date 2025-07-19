
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type StudentMark = {
  id: string;
  student_id: string;
  class_id: string;
  academic_quarter_id: string;
  mark_type: 'assessment' | 'exam';
  mark: number | null;
  max_mark: number;
  teacher_id: string | null;
  entered_at: string | null;
  school_id: string;
  students: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
};

export function useStudentMarks(classId?: string, quarterId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-marks', classId, quarterId, user?.id],
    queryFn: async () => {
      if (!user || !classId || !quarterId) return [];

      console.log('Fetching student marks for class:', classId, 'quarter:', quarterId);

      const { data, error } = await supabase
        .from('student_marks')
        .select(`
          *,
          students!inner(
            id,
            first_name,
            last_name,
            student_id
          )
        `)
        .eq('class_id', classId)
        .eq('academic_quarter_id', quarterId)
        .order('students(last_name)');

      if (error) {
        console.error('Error fetching student marks:', error);
        throw error;
      }

      console.log('Student marks data:', data);
      return data as StudentMark[];
    },
    enabled: !!user && !!classId && !!quarterId
  });
}

export function useStudentsInClass(classId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['students-in-class', classId, user?.id],
    queryFn: async () => {
      if (!user || !classId) return [];

      console.log('Fetching students in class:', classId);

      // Get students enrolled in this specific class through student_classes table
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          students!inner(
            id,
            first_name,
            last_name,
            student_id,
            grade_id,
            school_id
          )
        `)
        .eq('class_id', classId)
        .eq('is_active', true)
        .eq('students.is_active', true)
        .order('students(last_name)');

      if (error) {
        console.error('Error fetching students in class:', error);
        throw error;
      }

      console.log('Students in class data:', data);
      
      // Transform the data to return just the student objects
      const students = data.map(item => item.students);
      return students;
    },
    enabled: !!user && !!classId
  });
}

export function useUpsertStudentMark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      studentId: string;
      classId: string;
      quarterIds: string;
      markType: 'assessment' | 'exam';
      mark: number | null;
      teacherId: string;
      schoolId: string;
    }) => {
      const { data, error } = await supabase
        .from('student_marks')
        .upsert({
          student_id: params.studentId,
          class_id: params.classId,
          academic_quarter_id: params.quarterIds,
          mark_type: params.markType,
          mark: params.mark,
          teacher_id: params.teacherId,
          school_id: params.schoolId,
          max_mark: 20
        }, {
          onConflict: 'student_id,class_id,academic_quarter_id,mark_type'
        })
        .select();

      if (error) {
        console.error('Error upserting student mark:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
      toast.success('Mark saved successfully');
    },
    onError: (error) => {
      console.error('Error saving mark:', error);
      toast.error('Failed to save mark');
    }
  });
}
