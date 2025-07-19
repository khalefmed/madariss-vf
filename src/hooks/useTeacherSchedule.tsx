
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export type TeacherSchedule = {
  id: string;
  day_of_week: string;
  time_slot: string;
  class_id: string;
  classes: {
    id: string;
    name: string;
    grade_levels: {
      name: string;
    };
  };
};

export function useTeacherSchedule() {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['teacher-schedule', user?.id],
    queryFn: async () => {
      if (!user || userRole?.role !== 'teacher') {
        return [];
      }

      console.log('Fetching teacher schedule for user:', user.id);

      // First get the teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        console.error('Error fetching teacher record:', teacherError);
        throw teacherError;
      }

      if (!teacherData) {
        console.log('No teacher record found for user:', user.id);
        return [];
      }

      console.log('Teacher record found:', teacherData);

      // Get the teacher's assigned class IDs
      const { data: teacherClassData, error: teacherClassError } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', teacherData.id)
        .eq('is_active', true);

      if (teacherClassError) {
        console.error('Error fetching teacher classes:', teacherClassError);
        throw teacherClassError;
      }

      if (!teacherClassData || teacherClassData.length === 0) {
        console.log('No classes assigned to teacher:', teacherData.id);
        return [];
      }

      const classIds = teacherClassData.map(tc => tc.class_id);
      console.log('Teacher assigned to classes:', classIds);

      // Get the teacher's assigned classes and their schedules
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          day_of_week,
          time_slot,
          class_id,
          classes!inner(
            id,
            name,
            grade_levels(name)
          )
        `)
        .in('class_id', classIds)
        .eq('is_active', true)
        .not('class_id', 'is', null)
        .order('day_of_week')
        .order('time_slot');

      if (error) {
        console.error('Error fetching teacher schedule:', error);
        throw error;
      }

      console.log('Teacher schedule data:', data);
      return data as TeacherSchedule[];
    },
    enabled: !!user && userRole?.role === 'teacher'
  });
}
