import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export function useGradeDistribution() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['grade-distribution', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) {
        throw new Error('No school ID found');
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          grade_levels:grade_id (
            name
          )
        `)
        .eq('school_id', userRole.school_id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching grade distribution:', error);
        throw error;
      }

      // Count students by grade level
      const gradeCount: Record<string, number> = {};
      
      data?.forEach(student => {
        const gradeName = student.grade_levels?.name || 'Non assigné';
        gradeCount[gradeName] = (gradeCount[gradeName] || 0) + 1;
      });

      // Convert to chart format
      const chartData = Object.entries(gradeCount).map(([grade, students]) => ({
        grade,
        students
      }));

      return chartData;
    },
    enabled: !!userRole?.school_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}