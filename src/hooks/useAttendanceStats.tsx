import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export function useAttendanceStats() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['attendance-stats', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) {
        throw new Error('No school ID found');
      }

      // Get last 7 days attendance data
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const attendanceData = await Promise.all(
        dates.map(async (date) => {
          const { data, error } = await supabase
            .from('attendance')
            .select('status')
            .eq('school_id', userRole.school_id)
            .eq('date', date);

          if (error) {
            console.error('Error fetching attendance for date:', date, error);
            return { date, attendance: 0 };
          }

          const totalRecords = data?.length || 0;
          const absentCount = data?.filter(record => record.status === 'absent').length || 0;
          const absenceRate = totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0;

          // Format date for display
          const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          const dayName = dayNames[new Date(date).getDay()];

          return {
            date: dayName,
            attendance: absenceRate // Renamed to attendance for chart compatibility but contains absence rate
          };
        })
      );

      return attendanceData;
    },
    enabled: !!userRole?.school_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}