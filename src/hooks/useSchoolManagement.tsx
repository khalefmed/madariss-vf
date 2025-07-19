import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useUpdateSchoolSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      schoolId: string;
      subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due';
      subscriptionTier?: 'basic' | 'premium' | 'enterprise';
      subscriptionEnd?: string;
    }) => {
      console.log('Updating school subscription:', data);

      const updateData: any = {
        subscription_status: data.subscriptionStatus,
        updated_at: new Date().toISOString(),
      };

      if (data.subscriptionTier) {
        updateData.subscription_tier = data.subscriptionTier;
      }

      if (data.subscriptionEnd) {
        updateData.subscription_end = data.subscriptionEnd;
      }

      // Perform the update - RLS policy now handles permissions correctly
      const { data: result, error } = await supabase
        .from('schools')
        .update(updateData)
        .eq('id', data.schoolId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      console.log('Update successful:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: "Subscription updated",
        description: "School subscription has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error updating subscription",
        description: error.message || 'Failed to update subscription',
        variant: "destructive"
      });
    }
  });
}

export function useSchoolManagers(schoolId: string) {
  return useQuery({
    queryKey: ['school-managers', schoolId],
    queryFn: async () => {
      // First get school users with admin/super_admin roles
      const { data: schoolUsers, error: schoolUsersError } = await supabase
        .from('school_users')
        .select('*')
        .eq('school_id', schoolId)
        .in('role', ['super_admin', 'admin'])
        .eq('is_active', true);

      if (schoolUsersError) throw schoolUsersError;

      if (!schoolUsers || schoolUsers.length === 0) {
        return [];
      }

      // Then get profiles for those users
      const userIds = schoolUsers.map(su => su.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const managersWithProfiles = schoolUsers.map(schoolUser => ({
        ...schoolUser,
        profiles: profiles?.find(profile => profile.id === schoolUser.user_id) || null
      }));

      return managersWithProfiles;
    },
    enabled: !!schoolId
  });
}

export function useResetUserPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { userId: string; email: string }) => {
      console.log('Resetting user password:', data);

      const { data: result, error } = await supabase.functions.invoke('reset-user-password', {
        body: { 
          userId: data.userId,
          email: data.email,
          newPassword: 'Madariss123'
        }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Failed to reset password');

      return result;
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "User password has been reset to 'Madariss123'."
      });
    },
    onError: (error: any) => {
      console.error('Error resetting password:', error);
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useDeactivateSchoolUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { userId: string; schoolId: string }) => {
      console.log('Deactivating school user:', data);

      const { error } = await supabase
        .from('school_users')
        .update({ is_active: false })
        .eq('user_id', data.userId)
        .eq('school_id', data.schoolId);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['school-managers', data.schoolId] });
      toast({
        title: "User deactivated",
        description: "School manager has been deactivated successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error deactivating user",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
