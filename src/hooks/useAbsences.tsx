
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Absence = Tables<'attendance'> & {
  students?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  classes?: {
    id: string;
    name: string;
  };
};

export type StudentClassAbsenceCount = {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  absence_count: number;
};

export function useAbsences() {
  return useQuery({
    queryKey: ['absences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students(
            id,
            first_name,
            last_name,
            student_id
          ),
          classes(
            id,
            name
          )
        `)
        .eq('status', 'absent')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Absence[];
    }
  });
}

export function useStudentClassAbsences(studentId?: string) {
  return useQuery({
    queryKey: ['student-class-absences', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          class_id,
          classes(
            id,
            name
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'absent');

      if (error) throw error;

      // Group absences by class and count them
      const classAbsenceCounts = data.reduce((acc: Record<string, any>, absence) => {
        const classId = absence.class_id;
        const className = absence.classes?.name || 'Unknown Class';
        
        if (!acc[classId]) {
          acc[classId] = {
            class_id: classId,
            class_name: className,
            absence_count: 0
          };
        }
        acc[classId].absence_count++;
        
        return acc;
      }, {});

      return Object.values(classAbsenceCounts);
    },
    enabled: !!studentId
  });
}

export function useCreateAbsences() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      studentIds,
      classIds,
      date
    }: {
      studentIds: string[];
      classIds: string[];
      date: string;
    }) => {
      console.log('Creating absences:', { studentIds, classIds, date });
      
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      // Create absence records for each student and each class
      const absenceRecords = [];
      
      for (const studentId of studentIds) {
        for (const classId of classIds) {
          absenceRecords.push({
            student_id: studentId,
            class_id: classId,
            school_id: schoolUsers.school_id,
            date: date,
            status: 'absent',
            marked_by: (await supabase.auth.getUser()).data.user?.id,
            notes: `Marked absent on ${new Date().toLocaleString()}`
          });
        }
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert(absenceRecords)
        .select();

      if (error) {
        console.error('Error creating absences:', error);
        throw error;
      }

      console.log('Absences created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['student-class-absences'] });
      toast({
        title: "Absences recorded",
        description: `Successfully recorded ${data.length} absence entries.`
      });
    },
    onError: (error: any) => {
      console.error('Error recording absences:', error);
      toast({
        title: "Error recording absences",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
