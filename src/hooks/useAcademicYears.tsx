
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type AcademicYear = Tables<'academic_years'>;

export function useAcademicYears() {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      console.log('Fetching academic years...');
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching academic years:', error);
        throw error;
      }
      
      console.log('Academic years fetched successfully:', data);
      return data;
    }
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (yearData: {
      year_name: string;
      start_date: string;
      end_date: string;
      is_active?: boolean;
      is_current?: boolean;
    }) => {
      console.log('Creating academic year with data:', yearData);
      
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      // If setting as current, first unset all other years as current
      if (yearData.is_current) {
        await supabase
          .from('academic_years')
          .update({ is_current: false })
          .eq('school_id', schoolUsers.school_id);
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert([{
          ...yearData,
          school_id: schoolUsers.school_id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating academic year:', error);
        throw error;
      }

      console.log('Academic year created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: "Academic year created",
        description: "Academic year has been created successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error in academic year creation:', error);
      toast({
        title: "Error creating academic year",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ yearId, updates }: { yearId: string; updates: Partial<AcademicYear> }) => {
      console.log('Updating academic year:', { yearId, updates });
      
      // If setting as current, first unset all other years as current
      if (updates.is_current) {
        const { data: schoolUsers } = await supabase
          .from('school_users')
          .select('school_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (schoolUsers) {
          await supabase
            .from('academic_years')
            .update({ is_current: false })
            .eq('school_id', schoolUsers.school_id)
            .neq('id', yearId);
        }
      }

      const { data, error } = await supabase
        .from('academic_years')
        .update(updates)
        .eq('id', yearId)
        .select()
        .single();

      if (error) {
        console.error('Error updating academic year:', error);
        throw error;
      }

      console.log('Academic year updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({
        title: "Academic year updated",
        description: "Academic year has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error updating academic year:', error);
      toast({
        title: "Error updating academic year",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
