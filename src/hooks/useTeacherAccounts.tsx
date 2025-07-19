
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface TeacherAccount {
  id: string;
  name: string;
  phone: string | null;
  national_number: string;
  nationality: string | null;
  email: string | null;
  user_id: string | null;
  hasAccount: boolean;
  profile?: {
    email: string | null;
  };
}

export function useTeacherAccounts() {
  const { data: userRole } = useUserRole();

  return useQuery({
    queryKey: ['teacher-accounts', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) return [];

      const { data: teachers, error } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          phone,
          national_number,
          nationality,
          email,
          user_id
        `)
        .eq('school_id', userRole.school_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      console.log('🔍 Teachers data:', teachers);

      // Get profiles for teachers with user_id
      const teachersWithUserIds = teachers?.filter(t => t.user_id) || [];
      let profiles: any[] = [];
      
      console.log('🔍 Teachers with user IDs:', teachersWithUserIds);
      
      if (teachersWithUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', teachersWithUserIds.map(t => t.user_id));
        
        console.log('🔍 Profiles data:', profilesData);
        console.log('🔍 Profiles error:', profilesError);
        
        profiles = profilesData || [];
      }

      const result = (teachers || []).map(teacher => {
        const profile = teacher.user_id ? profiles.find(p => p.id === teacher.user_id) : undefined;
        console.log(`🔍 Teacher ${teacher.name} - Profile:`, profile);
        
        return {
          ...teacher,
          hasAccount: !!teacher.user_id,
          profile
        };
      });

      console.log('🔍 Final result:', result);
      return result as TeacherAccount[];
    },
    enabled: !!userRole?.school_id
  });
}

export function useCreateTeacherAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      teacherId,
      email,
      password,
      firstName,
      lastName,
      schoolId
    }: {
      teacherId: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      schoolId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-school-user', {
        body: {
          userData: {
            email,
            password,
            firstName,
            lastName,
            role: 'teacher',
            schoolId,
            teacherId
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-accounts'] });
      toast({
        title: "Compte créé",
        description: "Le compte enseignant a été créé avec succès."
      });
    },
    onError: (error: any) => {
      console.error('Error creating teacher account:', error);
      const message = error.message.includes('email_exists') 
        ? "Un compte avec cette adresse email existe déjà."
        : error.message || "Une erreur est survenue lors de la création du compte.";
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
    }
  });
}

export function useResetTeacherPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      email,
      newPassword
    }: {
      userId: string;
      email: string;
      newPassword: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId,
          email,
          newPassword
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-accounts'] });
      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe a été réinitialisé avec succès."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la réinitialisation du mot de passe.",
        variant: "destructive"
      });
    }
  });
}
