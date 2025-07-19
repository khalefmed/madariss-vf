import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type StudentPayment = Tables<'student_payments'> & {
  students?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  academic_years?: {
    id: string;
    year_name: string;
  };
};

export type NewStudentPayment = TablesInsert<'student_payments'>;

export const useStudentPayments = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-payments', studentId],
    queryFn: async () => {
      console.log('Fetching payments for student:', studentId);
      
      let query = supabase
        .from('student_payments')
        .select(`
          *,
          students!inner(
            id,
            first_name,
            last_name,
            student_id
          ),
          academic_years(
            id,
            year_name
          )
        `)
        .order('payment_date', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching student payments:', error);
        throw error;
      }
      
      console.log('Student payments fetched:', data);
      return data || [];
    },
    enabled: !!studentId || studentId === undefined,
  });
};

export const useAddStudentPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: NewStudentPayment) => {
      console.log('Adding student payment:', payment);
      
      const { data, error } = await supabase
        .from('student_payments')
        .insert([payment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding student payment:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      toast.success('Payment added successfully');
    },
    onError: (error) => {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    },
  });
};

export const useUpdateStudentPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...payment }: Partial<StudentPayment> & { id: string }) => {
      console.log('Updating student payment:', id, payment);
      
      const { data, error } = await supabase
        .from('student_payments')
        .update(payment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating student payment:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    },
  });
};

export const useDeleteStudentPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting student payment:', id);
      
      const { error } = await supabase
        .from('student_payments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting student payment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
    },
  });
};
