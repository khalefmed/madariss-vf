
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching user role for:', user.id);

      const { data, error } = await supabase
        .from('school_users')
        .select('role, school_id, schools(name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }

      console.log('User role fetched:', data);
      return data;
    },
    enabled: !!user && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useIsSuperAdmin() {
  const { data: userRole } = useUserRole();
  return userRole?.role === 'super_admin';
}
