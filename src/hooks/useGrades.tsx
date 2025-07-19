
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define our own type for grade levels with pricing fields
export type GradeLevel = {
  id: string;
  school_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  monthly_price: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
};

export function useGrades() {
  return useQuery({
    queryKey: ['grade-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grade_levels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as GradeLevel[];
    }
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gradeData: {
      name: string;
      display_order?: number;
    }) => {
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      const { data, error } = await supabase
        .from('grade_levels')
        .insert([{
          ...gradeData,
          school_id: schoolUsers.school_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      toast({
        title: "Grade created",
        description: "Grade has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating grade",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...gradeData }: {
      id: string;
      name: string;
      display_order?: number;
      monthly_price?: number;
      currency?: string;
    }) => {
      const { data, error } = await supabase
        .from('grade_levels')
        .update(gradeData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      toast({
        title: "Grade updated",
        description: "Grade has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating grade",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
