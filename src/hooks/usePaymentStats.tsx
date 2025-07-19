import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export function usePaymentStats() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['payment-stats', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) {
        throw new Error('No school ID found');
      }

      // Get last 6 months payment data
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          name: date.toLocaleDateString('fr-FR', { month: 'short' })
        };
      }).reverse();

      const paymentData = await Promise.all(
        months.map(async ({ year, month, name }) => {
          const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
          const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

          const { data, error } = await supabase
            .from('student_payments')
            .select('amount')
            .eq('school_id', userRole.school_id)
            .gte('payment_date', startDate)
            .lte('payment_date', endDate);

          if (error) {
            console.error('Error fetching payments for month:', name, error);
            return { month: name, amount: 0 };
          }

          const totalAmount = data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

          return {
            month: name,
            amount: totalAmount
          };
        })
      );

      return paymentData;
    },
    enabled: !!userRole?.school_id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}