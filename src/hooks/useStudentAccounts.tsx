
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentAccount {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  grade_levels?: {
    name: string;
  };
  profile?: {
    email: string;
  };
  user_id?: string;
  hasAccount: boolean;
}

export const useStudentAccounts = () => {
  return useQuery({
    queryKey: ['student-accounts'],
    queryFn: async () => {
      console.log('🔍 Fetching student accounts...');
      
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          first_name,
          last_name,
          email,
          user_id,
          grade_levels!inner(name)
        `)
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching student accounts:', error);
        throw error;
      }

      console.log('✅ Student accounts fetched:', students?.length || 0);

      // Get user IDs for students who have accounts
      const userIds = students?.filter(s => s.user_id).map(s => s.user_id!) || [];
      
      // Fetch profiles for users who have accounts
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('❌ Error fetching profiles:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      // Map students with account status and profile data
      const studentsWithAccountStatus: StudentAccount[] = (students || []).map(student => {
        const profile = profiles.find(p => p.id === student.user_id);
        return {
          ...student,
          hasAccount: !!student.user_id,
          profile: profile ? { email: profile.email } : undefined
        };
      });

      return studentsWithAccountStatus;
    },
  });
};

export const useCreateStudentAccount = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      email, 
      password,
      firstName,
      lastName,
      schoolId
    }: { 
      studentId: string; 
      email: string; 
      password: string;
      firstName: string;
      lastName: string;
      schoolId: string;
    }) => {
      console.log('🔐 Creating student account for student ID:', studentId);

      // Call the edge function with the correct format
      const { data, error } = await supabase.functions.invoke('create-school-user', {
        body: {
          userData: {
            email,
            password,
            firstName,
            lastName,
            role: 'student',
            schoolId,
            studentId
          }
        }
      });

      if (error) {
        console.error('❌ Error creating student account:', error);
        throw error;
      }

      console.log('✅ Student account created successfully');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Compte créé",
        description: "Le compte étudiant a été créé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['student-accounts'] });
    },
    onError: (error: any) => {
      console.error('❌ Failed to create student account:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte étudiant.",
        variant: "destructive"
      });
    }
  });
};

export const useResetStudentPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, email, newPassword }: { userId: string; email: string; newPassword: string }) => {
      console.log('🔄 Resetting password for user:', userId);

      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId,
          email,
          newPassword
        }
      });

      if (error) {
        console.error('❌ Error resetting password:', error);
        throw error;
      }

      console.log('✅ Password reset successfully');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe a été réinitialisé avec succès. Les nouvelles informations de connexion sont affichées."
      });
    },
    onError: (error: any) => {
      console.error('❌ Failed to reset password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe.",
        variant: "destructive"
      });
    }
  });
};
