
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export type AcademicQuarter = {
  id: string;
  academic_year_id: string;
  quarter: 'Q1' | 'Q2' | 'Q3';
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export function useAcademicQuarters() {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['academic-quarters', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching academic quarters for user:', user.id);

      const { data, error } = await supabase
        .from('academic_quarters')
        .select(`
          *,
          academic_years!inner(
            id,
            year_name,
            school_id
          )
        `)
        .order('quarter');

      if (error) {
        console.error('Error fetching academic quarters:', error);
        throw error;
      }

      console.log('Academic quarters data:', data);
      return data as AcademicQuarter[];
    },
    enabled: !!user
  });
}

export function useActiveQuarter() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-quarter', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('academic_quarters')
        .select(`
          *,
          academic_years!inner(
            id,
            year_name,
            school_id,
            is_current
          )
        `)
        .eq('is_active', true)
        .eq('academic_years.is_current', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active quarter:', error);
        throw error;
      }

      return data as AcademicQuarter | null;
    },
    enabled: !!user
  });
}
