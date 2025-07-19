import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useStudentDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('No user ID found');
      }

      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, school_id, balance, grade_id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !studentData) {
        console.error('Error fetching student data:', studentError);
        throw studentError || new Error('Student not found');
      }

      // Get current average marks
      const { data: quarterAverages, error: averagesError } = await supabase
        .from('student_quarter_averages')
        .select('quarter_average')
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (averagesError) {
        console.error('Error fetching averages:', averagesError);
      }

      // Get recent marks
      const { data: recentMarks, error: marksError } = await supabase
        .from('student_marks')
        .select(`
          mark,
          max_mark,
          mark_type,
          entered_at,
          classes:class_id (name)
        `)
        .eq('student_id', studentData.id)
        .order('entered_at', { ascending: false })
        .limit(5);

      if (marksError) {
        console.error('Error fetching recent marks:', marksError);
      }

      // Get attendance rate for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split('T')[0];

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', studentData.id)
        .gte('date', startDate);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
      }

      // Calculate absence rate for current month
      let absenceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const absentCount = attendanceData.filter(record => record.status === 'absent').length;
        absenceRate = Math.round((absentCount / attendanceData.length) * 100);
      }

      // Get payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('student_payments')
        .select('amount, payment_date')
        .eq('student_id', studentData.id)
        .order('payment_date', { ascending: false })
        .limit(3);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      const currentAverage = quarterAverages?.[0]?.quarter_average || 0;
      const normalizedAverage = currentAverage ? Math.round(currentAverage * 100) / 100 : 0;

      return {
        currentAverage: normalizedAverage,
        absenceRate,
        balance: studentData.balance || 0,
        recentMarks: recentMarks || [],
        recentPayments: paymentsData || [],
        marksCount: recentMarks?.length || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}