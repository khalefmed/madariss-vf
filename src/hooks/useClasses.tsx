
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Class = Tables<'classes'> & {
  grade_levels?: {
    id: string;
    name: string;
    display_order: number;
  };
};

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          grade_levels(
            id,
            name,
            display_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Class[];
    }
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classData: {
      name: string;
      grade_id?: string;
      academic_year_id?: string;
      coefficient?: number;
    }) => {
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          school_id: schoolUsers.school_id,
        }])
        .select(`
          *,
          grade_levels(
            id,
            name,
            display_order
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class created",
        description: "Class has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating class",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

// Helper function to format class display name
export function formatClassDisplayName(classItem: Class): string {
  if (classItem.grade_levels?.name) {
    return `${classItem.name} - ${classItem.grade_levels.name}`;
  }
  return classItem.name;
}
