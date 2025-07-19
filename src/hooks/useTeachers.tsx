import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define proper types for teachers since they're not in the generated types yet
export interface Teacher {
  id: string;
  school_id: string;
  name: string;
  phone?: string;
  national_number: string;
  nationality?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string; // Add this field
  teacher_classes?: Array<{
    id: string;
    hourly_salary: number;
    currency: string;
    is_active: boolean;
    classes: {
      id: string;
      name: string;
      grade_levels?: {
        name: string;
      };
    };
  }>;
}

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // First get teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (teachersError) throw teachersError;

      // Then get teacher_classes with class info for each teacher
      const teachersWithClasses = await Promise.all(
        (teachersData || []).map(async (teacher) => {
          const { data: classesData } = await supabase
            .from('teacher_classes')
            .select(`
              id,
              hourly_salary,
              currency,
              is_active,
              class_id
            `)
            .eq('teacher_id', teacher.id)
            .eq('is_active', true);

          // Get class details for each assignment
          const classesWithDetails = await Promise.all(
            (classesData || []).map(async (tc) => {
              const { data: classData } = await supabase
                .from('classes')
                .select(`
                  id,
                  name,
                  grade_levels(name)
                `)
                .eq('id', tc.class_id)
                .single();

              return {
                ...tc,
                classes: classData || { id: tc.class_id, name: 'Unknown Class' }
              };
            })
          );

          return {
            ...teacher,
            teacher_classes: classesWithDetails
          };
        })
      );

      return teachersWithClasses as Teacher[];
    }
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacherData: {
      name: string;
      phone?: string;
      national_number: string;
      nationality?: string;
      email?: string;
    }) => {
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      // Create only the teacher record, no user account
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .insert([{
          ...teacherData,
          school_id: schoolUsers.school_id,
        }])
        .select()
        .single();

      if (teacherError) throw teacherError;

      return teacher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Enseignant créé",
        description: "L'enseignant a été ajouté avec succès."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...teacherData
    }: {
      id: string;
      name?: string;
      phone?: string;
      nationality?: string;
      email?: string;
    }) => {
      const { data, error } = await supabase
        .from('teachers')
        .update(teacherData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher updated",
        description: "Teacher information has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating teacher",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useAssignTeacherToClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      teacher_id,
      class_id,
      hourly_salary,
      currency = 'MRU'
    }: {
      teacher_id: string;
      class_id: string;
      hourly_salary: number;
      currency?: string;
    }) => {
      const { data, error } = await supabase
        .from('teacher_classes')
        .insert([{
          teacher_id,
          class_id,
          hourly_salary,
          currency
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class assigned",
        description: "Teacher has been assigned to the class successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error assigning class",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUnassignTeacherFromClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacherClassId: string) => {
      const { error } = await supabase
        .from('teacher_classes')
        .update({ is_active: false })
        .eq('id', teacherClassId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Class unassigned",
        description: "Teacher has been unassigned from the class successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error unassigning class",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useSearchTeachers(searchTerm: string) {
  return useQuery({
    queryKey: ['teachers', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      // Get teachers matching search
      const { data: teachersData, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,national_number.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      // Get teacher classes for search results
      const teachersWithClasses = await Promise.all(
        (teachersData || []).map(async (teacher) => {
          const { data: classesData } = await supabase
            .from('teacher_classes')
            .select(`
              id,
              hourly_salary,
              currency,
              is_active,
              class_id
            `)
            .eq('teacher_id', teacher.id)
            .eq('is_active', true);

          // Get class details for each assignment
          const classesWithDetails = await Promise.all(
            (classesData || []).map(async (tc) => {
              const { data: classData } = await supabase
                .from('classes')
                .select(`
                  id,
                  name,
                  grade_levels(name)
                `)
                .eq('id', tc.class_id)
                .single();

              return {
                ...tc,
                classes: classData || { id: tc.class_id, name: 'Unknown Class' }
              };
            })
          );

          return {
            ...teacher,
            teacher_classes: classesWithDetails
          };
        })
      );

      return teachersWithClasses as Teacher[];
    },
    enabled: !!searchTerm.trim()
  });
}

// Helper function to format class display name for teachers
export function formatTeacherClassDisplayName(classData: { name: string; grade_levels?: { name: string } }): string {
  if (classData.grade_levels?.name) {
    return `${classData.name} - ${classData.grade_levels.name}`;
  }
  return classData.name;
}

export function useTeacherClasses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching classes for teacher:', user.id);

      // First get the teacher record for this user
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError || !teacher) {
        console.log('No teacher record found for user:', user.id);
        return [];
      }

      // Then get teacher_classes with class info
      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          id,
          class_id,
          hourly_salary,
          currency,
          is_active,
          classes!inner(
            id,
            name,
            grade_levels(
              name
            )
          )
        `)
        .eq('teacher_id', teacher.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching teacher classes:', error);
        throw error;
      }

      console.log('Teacher classes data:', data);
      return data || [];
    },
    enabled: !!user
  });
}
