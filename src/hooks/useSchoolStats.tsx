
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export function useSchoolStats() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['school-stats', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) {
        throw new Error('No school ID found');
      }

      console.log('Fetching school stats for school:', userRole.school_id);

      // Fetch students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', userRole.school_id)
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // Fetch teachers count
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id')
        .eq('school_id', userRole.school_id)
        .eq('is_active', true);

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
        throw teachersError;
      }

      // Fetch classes count
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', userRole.school_id)
        .eq('is_active', true);

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        throw classesError;
      }

      // Fetch grade levels count
      const { data: gradesData, error: gradesError } = await supabase
        .from('grade_levels')
        .select('id')
        .eq('school_id', userRole.school_id)
        .eq('is_active', true);

      if (gradesError) {
        console.error('Error fetching grades:', gradesError);
        throw gradesError;
      }

      // Fetch attendance rate for today
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status')
        .eq('school_id', userRole.school_id)
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
      }

      // Calculate absence rate
      let absenceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const absentCount = attendanceData.filter(record => record.status === 'absent').length;
        absenceRate = Math.round((absentCount / attendanceData.length) * 100);
      }

      // Fetch monthly revenue
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('student_payments')
        .select('amount')
        .eq('school_id', userRole.school_id)
        .gte('payment_date', startOfMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Fetch average marks
      const { data: marksData, error: marksError } = await supabase
        .from('student_marks')
        .select('mark, max_mark')
        .eq('school_id', userRole.school_id)
        .not('mark', 'is', null);

      if (marksError) {
        console.error('Error fetching marks:', marksError);
      }

      let averageMark = 0;
      if (marksData && marksData.length > 0) {
        const normalizedMarks = marksData.map(m => 
          m.mark && m.max_mark ? (m.mark / m.max_mark) * 20 : 0
        );
        averageMark = normalizedMarks.reduce((sum, mark) => sum + mark, 0) / normalizedMarks.length;
      }

      const stats = {
        studentsCount: studentsData?.length || 0,
        teachersCount: teachersData?.length || 0,
        classesCount: classesData?.length || 0,
        gradesCount: gradesData?.length || 0,
        absenceRate: absenceRate,
        monthlyRevenue: monthlyRevenue,
        averageMark: Math.round(averageMark * 100) / 100 // Round to 2 decimal places
      };

      console.log('School stats fetched:', stats);
      return stats;
    },
    enabled: !!userRole?.school_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
