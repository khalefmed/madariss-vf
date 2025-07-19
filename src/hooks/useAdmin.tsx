import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateSchoolWithUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      schoolName: string;
      schoolSlug: string;
      schoolEmail?: string;
      userEmail: string;
      userPassword: string;
      userFirstName: string;
      userLastName: string;
      userRole: 'super_admin' | 'admin';
    }) => {
      console.log('Creating school and user:', data);

      // Prepare the data for the edge function
      const schoolData = {
        name: data.schoolName,
        slug: data.schoolSlug.toLowerCase().replace(/\s+/g, '-'),
        email: data.schoolEmail || undefined,
        subscription_status: 'active'
      };

      const userData = {
        email: data.userEmail,
        password: data.userPassword,
        firstName: data.userFirstName,
        lastName: data.userLastName,
        role: data.userRole
      };

      // Call the edge function to create school and user
      const { data: result, error } = await supabase.functions.invoke('create-school-user', {
        body: { schoolData, userData }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Failed to create school and user');

      return { school: result.school, user: result.user };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: "School and user created",
        description: "School has been created with the admin user successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error creating school and user:', error);
      
      // Extract the actual error message
      let errorMessage = error.message;
      
      // Handle edge function errors
      if (error.name === 'FunctionsHttpError') {
        errorMessage = "Failed to create school and user. Please check the server logs for details.";
      }
      
      toast({
        title: "Error creating school and user",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}

export function useCreateUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      schoolId: string;
      role: 'admin' | 'teacher' | 'academic_director' | 'accountant' | 'supervisor';
    }) => {
      console.log('Creating user:', data);

      // Call the edge function to create user (this handles admin user creation)
      const { data: result, error } = await supabase.functions.invoke('create-school-user', {
        body: { 
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

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Failed to create user');

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] });
      toast({
        title: "User created",
        description: "User has been created successfully."
      });
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useSchoolUsers() {
  return useQuery({
    queryKey: ['school-users'],
    queryFn: async () => {
      console.log('Fetching school users...');
      
      // Get current user's school ID first
      const { data: currentUserData } = await supabase.auth.getUser();
      if (!currentUserData.user) {
        throw new Error('No authenticated user');
      }

      // Get current user's school
      const { data: currentUserSchool, error: schoolError } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', currentUserData.user.id)
        .eq('is_active', true)
        .single();

      if (schoolError) {
        console.error('Error fetching user school:', schoolError);
        throw schoolError;
      }

      // Fetch school users from the same school
      const { data: schoolUsersData, error: schoolUsersError } = await supabase
        .from('school_users')
        .select('*')
        .eq('school_id', currentUserSchool.school_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (schoolUsersError) {
        console.error('Error fetching school users:', schoolUsersError);
        throw schoolUsersError;
      }

      console.log('Raw school users data:', schoolUsersData);

      // Fetch profiles separately - get all profiles for these user IDs
      const userIds = schoolUsersData.map(user => user.user_id);
      console.log('User IDs for profile lookup:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      console.log('Profiles data:', profilesData);
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const combinedData = schoolUsersData.map(schoolUser => {
        const profile = profilesData?.find(profile => profile.id === schoolUser.user_id);
        console.log(`User ${schoolUser.user_id} profile:`, profile);
        return {
          ...schoolUser,
          profiles: profile || null
        };
      });

      console.log('Final combined data:', combinedData);
      return combinedData;
    }
  });
}

export function useDeleteUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deactivating user:', userId);

      // Deactivate user in school_users table instead of deleting
      const { error } = await supabase
        .from('school_users')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] });
      toast({
        title: "User deactivated",
        description: "User has been deactivated successfully."
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
