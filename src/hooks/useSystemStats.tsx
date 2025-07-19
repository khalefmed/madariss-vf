import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      console.log('Fetching system-wide statistics...');

      // Fetch all schools stats
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      // Get total users across all schools
      const { data: usersData, error: usersError } = await supabase
        .from('school_users')
        .select('id, role, school_id, is_active')
        .eq('is_active', true);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Get total students across all schools
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, school_id, is_active')
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // Get total teachers across all schools
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, school_id, is_active')
        .eq('is_active', true);

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
        throw teachersError;
      }

      // Get monthly revenue across all schools
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('student_payments')
        .select('amount, school_id')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0])
        .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Get attendance data for today across all schools
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status, school_id')
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
      }

      // Calculate statistics
      const totalSchools = schoolsData?.length || 0;
      const activeSchools = schoolsData?.filter(s => s.subscription_status === 'active').length || 0;
      const basicTierSchools = schoolsData?.filter(s => s.subscription_tier === 'basic').length || 0;
      const premiumTierSchools = schoolsData?.filter(s => s.subscription_tier === 'premium').length || 0;
      const enterpriseTierSchools = schoolsData?.filter(s => s.subscription_tier === 'enterprise').length || 0;
      
      const totalUsers = usersData?.length || 0;
      const adminUsers = usersData?.filter(u => u.role === 'admin').length || 0;
      const teacherUsers = usersData?.filter(u => u.role === 'teacher').length || 0;
      const studentUsers = usersData?.filter(u => u.role === 'student').length || 0;
      
      const totalStudents = studentsData?.length || 0;
      const totalTeachers = teachersData?.length || 0;
      
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      // Calculate system-wide absence rate
      let systemAbsenceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const absentCount = attendanceData.filter(record => record.status === 'absent').length;
        systemAbsenceRate = Math.round((absentCount / attendanceData.length) * 100);
      }

      // Growth calculations (mock data for now - would need historical data)
      const schoolsGrowth = totalSchools > 0 ? 12.5 : 0; // Mock 12.5% growth
      const usersGrowth = totalUsers > 0 ? 8.3 : 0; // Mock 8.3% growth
      const revenueGrowth = totalRevenue > 0 ? 15.7 : 0; // Mock 15.7% growth

      const stats = {
        totalSchools,
        activeSchools,
        basicTierSchools,
        premiumTierSchools,
        enterpriseTierSchools,
        totalUsers,
        adminUsers,
        teacherUsers,
        studentUsers,
        totalStudents,
        totalTeachers,
        totalRevenue,
        systemAbsenceRate,
        schoolsGrowth,
        usersGrowth,
        revenueGrowth,
        // School distribution by status
        schoolsByStatus: {
          active: activeSchools,
          inactive: schoolsData?.filter(s => s.subscription_status === 'inactive').length || 0,
          cancelled: schoolsData?.filter(s => s.subscription_status === 'cancelled').length || 0,
          past_due: schoolsData?.filter(s => s.subscription_status === 'past_due').length || 0,
        },
        // Revenue by tier
        revenueByTier: {
          basic: basicTierSchools * 1000, // Mock calculation
          premium: premiumTierSchools * 2500,
          enterprise: enterpriseTierSchools * 5000,
        }
      };

      console.log('System stats fetched:', stats);
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}