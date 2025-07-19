import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSchoolAdmins(schoolId: string) {
  return useQuery({
    queryKey: ['school-admins', schoolId],
    queryFn: async () => {
      console.log('Fetching school admins for school:', schoolId);
      
      // First get school users with admin/super_admin roles
      const { data: schoolUsers, error: schoolUsersError } = await supabase
        .from('school_users')
        .select('*')
        .eq('school_id', schoolId)
        .in('role', ['super_admin', 'admin'])
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (schoolUsersError) {
        console.error('Error fetching school users:', schoolUsersError);
        throw schoolUsersError;
      }

      console.log('School users found:', schoolUsers);

      if (!schoolUsers || schoolUsers.length === 0) {
        return [];
      }

      // Get the profiles data for those users
      const userIds = schoolUsers.map(su => su.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles found:', profiles);

      // Combine the data
      const adminsWithProfiles = schoolUsers.map(schoolUser => {
        const profile = profiles?.find(profile => profile.id === schoolUser.user_id);
        return {
          ...schoolUser,
          profiles: profile || {
            id: schoolUser.user_id,
            first_name: '',
            last_name: '',
            email: ''
          }
        };
      });

      console.log('Final admins data:', adminsWithProfiles);
      return adminsWithProfiles;
    },
    enabled: !!schoolId
  });
}

export function useCreateSchoolAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: 'admin' | 'super_admin';
      schoolId: string;
    }) => {
      console.log('Creating school admin:', data);

      const { data: result, error } = await supabase.functions.invoke('create-school-user', {
        body: {
          schoolData: null, // Not creating a new school
          userData: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            schoolId: data.schoolId
          }
        }
      });

      if (error) {
        console.error('Error creating admin:', error);
        throw error;
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create admin');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-admins', variables.schoolId] });
      toast({
        title: "Admin created",
        description: "School administrator has been created successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error creating admin:', error);
      toast({
        title: "Error creating admin",
        description: error.message || 'Failed to create administrator',
        variant: "destructive"
      });
    }
  });
}

export function useDeleteSchoolAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { userId: string; schoolId: string }) => {
      console.log('Deleting school admin:', data);

      // First deactivate the school user
      const { error: deactivateError } = await supabase
        .from('school_users')
        .update({ is_active: false })
        .eq('user_id', data.userId)
        .eq('school_id', data.schoolId);

      if (deactivateError) {
        console.error('Error deactivating school user:', deactivateError);
        throw deactivateError;
      }

      // Then call the edge function to delete the user completely
      const { data: result, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: data.userId }
      });

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete admin');
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['school-admins', variables.schoolId] });
      toast({
        title: "Admin deleted",
        description: "School administrator has been deleted successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error deleting admin",
        description: error.message || 'Failed to delete administrator',
        variant: "destructive"
      });
    }
  });
}

// Re-export the existing reset password function from the original hook
export { useResetUserPassword } from './useSchoolManagement';
