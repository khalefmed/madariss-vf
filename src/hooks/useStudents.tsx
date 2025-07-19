import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Student = Tables<'students'> & {
  grade_levels?: Tables<'grade_levels'> | null;
  classes?: Tables<'classes'> | null;
  student_grade_history?: (Tables<'student_grade_history'> & {
    grade_levels: Tables<'grade_levels'>;
  })[] | null;
};

export type NewStudent = TablesInsert<'students'>;
export type StudentUpdate = TablesUpdate<'students'>;

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      console.log('Fetching students with complete grade data...');
      
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          grade_levels(*),
          classes(*),
          student_grade_history(
            *,
            grade_levels(*)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      console.log('Students fetched with grade data:', data);
      return data || [];
    },
  });
};

export const useStudentByNationalId = () => {
  return useMutation({
    mutationFn: async (nationalId: string) => {
      console.log('Searching student by national ID:', nationalId);

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          grade_levels(*),
          classes(*),
          student_grade_history(
            *,
            grade_levels(*)
          )
        `)
        .or(`student_id.eq.${nationalId},national_id.eq.${nationalId}`)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No student found with national ID:', nationalId);
          return null;
        }
        console.error('Error searching student:', error);
        throw error;
      }

      console.log('Student found:', data);
      return data;
    },
  });
};

export const useUpdateStudentGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, gradeId }: { studentId: string; gradeId: string }) => {
      console.log('Updating student grade:', studentId, gradeId);

      const { data, error } = await supabase
        .from('students')
        .update({ grade_id: gradeId })
        .eq('id', studentId)
        .select(`
          *,
          grade_levels(*),
          classes(*),
          student_grade_history(
            *,
            grade_levels(*)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating student grade:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student grade updated successfully');
    },
    onError: (error) => {
      console.error('Error updating student grade:', error);
      toast.error('Failed to update student grade');
    },
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (student: NewStudent) => {
      console.log('Adding student:', student);

      const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...student }: Partial<StudentUpdate> & { id: string }) => {
      console.log('Updating student:', id, student);

      const { data, error } = await supabase
        .from('students')
        .update(student)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting student:', id);

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    },
  });
};
