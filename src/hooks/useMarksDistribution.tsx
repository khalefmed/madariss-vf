import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export function useMarksDistribution() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['marks-distribution', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) {
        throw new Error('No school ID found');
      }

      const { data, error } = await supabase
        .from('student_marks')
        .select('mark, max_mark')
        .eq('school_id', userRole.school_id)
        .not('mark', 'is', null);

      if (error) {
        console.error('Error fetching marks distribution:', error);
        throw error;
      }

      // Calculate grade ranges (out of 20)
      const gradeRanges = {
        'Excellent (16-20)': 0,
        'Bien (14-16)': 0,
        'Assez bien (12-14)': 0,
        'Passable (10-12)': 0,
        'Insuffisant (0-10)': 0
      };

      data?.forEach(record => {
        if (record.mark !== null && record.max_mark) {
          // Normalize to 20-point scale
          const normalizedMark = (record.mark / record.max_mark) * 20;
          
          if (normalizedMark >= 16) {
            gradeRanges['Excellent (16-20)']++;
          } else if (normalizedMark >= 14) {
            gradeRanges['Bien (14-16)']++;
          } else if (normalizedMark >= 12) {
            gradeRanges['Assez bien (12-14)']++;
          } else if (normalizedMark >= 10) {
            gradeRanges['Passable (10-12)']++;
          } else {
            gradeRanges['Insuffisant (0-10)']++;
          }
        }
      });

      // Convert to chart format
      const chartData = Object.entries(gradeRanges).map(([range, count]) => ({
        range,
        count
      }));

      return chartData;
    },
    enabled: !!userRole?.school_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}