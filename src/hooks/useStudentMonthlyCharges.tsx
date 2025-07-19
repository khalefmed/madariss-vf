
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type StudentMonthlyCharge = Tables<'student_monthly_charges'> & {
  students: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    balance: number | null;
    discount_percentage: number | null;
  };
  grade_levels: {
    id: string;
    name: string;
    monthly_price: number | null;
    currency: string | null;
  };
};

export const useStudentMonthlyCharges = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-monthly-charges', studentId],
    queryFn: async () => {
      console.log('Fetching monthly charges for student:', studentId);
      
      let query = supabase
        .from('student_monthly_charges')
        .select(`
          *,
          students!inner(
            id,
            first_name,
            last_name,
            student_id,
            balance,
            discount_percentage
          ),
          grade_levels!inner(
            id,
            name,
            monthly_price,
            currency
          )
        `)
        .order('charge_month', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching student monthly charges:', error);
        throw error;
      }
      
      console.log('Student monthly charges fetched:', data);
      return data || [];
    },
    enabled: !!studentId || studentId === undefined,
  });
};
