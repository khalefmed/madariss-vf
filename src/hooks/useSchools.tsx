
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type School = Tables<'schools'>;
export type SchoolUser = Tables<'school_users'>;

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schoolData: { name: string; slug: string; email?: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: "School created",
        description: "School has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating school",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useSchoolUsers(schoolId: string) {
  return useQuery({
    queryKey: ['school-users', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_users')
        .select(`
          *,
          profiles:user_id (first_name, last_name, email)
        `)
        .eq('school_id', schoolId);

      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });
}
