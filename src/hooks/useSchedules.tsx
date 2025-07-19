import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import type { Tables } from '@/integrations/supabase/types';

export type Schedule = Tables<'schedules'> & {
  grade_levels?: {
    id: string;
    name: string;
  };
  classes?: {
    id: string;
    name: string;
    grade_levels?: {
      name: string;
    };
  };
};

export const TIME_SLOTS = ['8h-10h', '10h-12h', '12h-14h'] as const;
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function useSchedules() {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          grade_levels(
            id,
            name
          ),
          classes(
            id,
            name,
            grade_levels(name)
          )
        `)
        .eq('is_active', true)
        .order('grade_id')
        .order('day_of_week')
        .order('time_slot');

      if (error) throw error;
      return data as Schedule[];
    },
    enabled: !!userRole // Only run when we know the user's role
  });
}

export function useSchedulesByGrade(gradeId: string) {
  const { data: userRole } = useUserRole();
  
  return useQuery({
    queryKey: ['schedules', 'by-grade', gradeId],
    queryFn: async () => {
      console.log('Fetching schedules for grade:', gradeId);
      
      if (!gradeId) {
        console.log('No grade ID provided');
        return [];
      }

      // For admins and academic directors, ensure all schedule slots exist for this grade
      if (userRole?.role === 'admin' || userRole?.role === 'super_admin' || userRole?.role === 'academic_director') {
        await initializeScheduleSlots(gradeId);
      }

      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          grade_levels(
            id,
            name
          ),
          classes(
            id,
            name,
            grade_levels(name)
          )
        `)
        .eq('grade_id', gradeId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('time_slot');

      if (error) {
        console.error('Error fetching schedules:', error);
        throw error;
      }
      
      console.log('Fetched schedules:', data);
      
      // For students, if no schedules exist, create empty slots for display
      if ((!data || data.length === 0) && userRole?.role === 'student') {
        console.log('No schedules found for student, creating empty display slots');
        const emptySlots: Schedule[] = [];
        
        for (const day of DAYS_OF_WEEK.slice(0, 6)) { // Monday to Saturday
          for (const timeSlot of TIME_SLOTS) {
            emptySlots.push({
              id: `empty-${day}-${timeSlot}`,
              school_id: '',
              grade_id: gradeId,
              day_of_week: day,
              time_slot: timeSlot,
              class_id: null,
              academic_year_id: null,
              is_active: true,
              created_at: '',
              updated_at: ''
            });
          }
        }
        return emptySlots;
      }
      
      return data as Schedule[];
    },
    enabled: !!gradeId && !!userRole
  });
}

// Helper function to initialize all schedule slots for a grade (admin/academic_director only)
async function initializeScheduleSlots(gradeId: string) {
  try {
    console.log('Initializing schedule slots for grade:', gradeId);
    
    // Get current user's school
    const { data: schoolUsers } = await supabase
      .from('school_users')
      .select('school_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!schoolUsers) {
      console.error('User not associated with any school');
      return;
    }

    const schoolId = schoolUsers.school_id;
    
    // Check which schedule slots already exist
    const { data: existingSchedules } = await supabase
      .from('schedules')
      .select('day_of_week, time_slot')
      .eq('grade_id', gradeId)
      .eq('school_id', schoolId);

    const existingSlots = new Set(
      existingSchedules?.map(s => `${s.day_of_week}-${s.time_slot}`) || []
    );

    // Create missing schedule slots
    const slotsToCreate = [];
    
    for (const day of DAYS_OF_WEEK.slice(0, 6)) { // Monday to Saturday
      for (const timeSlot of TIME_SLOTS) {
        const slotKey = `${day}-${timeSlot}`;
        if (!existingSlots.has(slotKey)) {
          slotsToCreate.push({
            school_id: schoolId,
            grade_id: gradeId,
            day_of_week: day,
            time_slot: timeSlot,
            class_id: null
          });
        }
      }
    }

    if (slotsToCreate.length > 0) {
      console.log('Creating schedule slots:', slotsToCreate);
      const { error } = await supabase
        .from('schedules')
        .insert(slotsToCreate);

      if (error) {
        console.error('Error creating schedule slots:', error);
        throw error;
      }
      
      console.log(`Successfully created ${slotsToCreate.length} schedule slots`);
    } else {
      console.log('All schedule slots already exist for this grade');
    }
  } catch (error) {
    console.error('Error initializing schedule slots:', error);
  }
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (scheduleData: {
      grade_id: string;
      day_of_week: string;
      time_slot: string;
      class_id?: string;
      academic_year_id?: string;
    }) => {
      // Get current user's school
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...scheduleData,
          school_id: schoolUsers.school_id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule created",
        description: "Schedule has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...scheduleData
    }: {
      id: string;
      class_id?: string;
    }) => {
      console.log('Updating schedule:', id, scheduleData);
      
      // Check for conflicts before updating
      if (scheduleData.class_id) {
        const { data: schedule } = await supabase
          .from('schedules')
          .select('grade_id, day_of_week, time_slot, school_id')
          .eq('id', id)
          .single();

        if (schedule) {
          await checkScheduleConflicts(
            scheduleData.class_id,
            schedule.grade_id,
            schedule.day_of_week,
            schedule.time_slot,
            schedule.school_id
          );
        }
      }

      const { data, error } = await supabase
        .from('schedules')
        .update(scheduleData)
        .eq('id', id)
        .select(`
          *,
          grade_levels(
            id,
            name
          ),
          classes(
            id,
            name,
            grade_levels(name)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
      
      console.log('Schedule updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule updated",
        description: "Schedule has been updated successfully."
      });
    },
    onError: (error: any) => {
      console.error('Schedule update error:', error);
      toast({
        title: "Error updating schedule",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}

// Helper function to check for schedule conflicts
async function checkScheduleConflicts(
  classId: string,
  gradeId: string,
  dayOfWeek: string,
  timeSlot: string,
  schoolId: string
) {
  // Check if the class is already assigned to another schedule at the same time
  const { data: classConflicts } = await supabase
    .from('schedules')
    .select('*')
    .eq('class_id', classId)
    .eq('day_of_week', dayOfWeek)
    .eq('time_slot', timeSlot)
    .eq('school_id', schoolId)
    .eq('is_active', true);

  if (classConflicts && classConflicts.length > 0) {
    throw new Error('This class is already scheduled at this time slot');
  }

  // Check if the teacher is already assigned to another class at the same time
  const { data: classInfo } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      teacher_classes(
        teacher_id,
        teachers(name)
      )
    `)
    .eq('id', classId)
    .single();

  if (classInfo?.teacher_classes && classInfo.teacher_classes.length > 0) {
    const teacherId = classInfo.teacher_classes[0].teacher_id;
    
    // Check if teacher has other classes at the same time
    const { data: teacherConflicts } = await supabase
      .from('schedules')
      .select(`
        *,
        classes(
          teacher_classes(teacher_id)
        )
      `)
      .eq('day_of_week', dayOfWeek)
      .eq('time_slot', timeSlot)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .neq('class_id', classId); // Exclude the current class being updated

    const hasConflict = teacherConflicts?.some(schedule => 
      schedule.classes?.teacher_classes?.some(tc => tc.teacher_id === teacherId)
    );

    if (hasConflict) {
      const teacherName = classInfo.teacher_classes[0].teachers?.name || 'Unknown';
      throw new Error(`Teacher ${teacherName} is already scheduled at this time slot`);
    }
  }
}

// Helper function to generate schedule for printing
export function generateScheduleForPrint(schedules: Schedule[], gradeName: string) {
  const scheduleGrid: { [key: string]: { [key: string]: string } } = {};
  
  // Initialize grid
  DAYS_OF_WEEK.slice(0, 6).forEach(day => {
    scheduleGrid[day] = {};
    TIME_SLOTS.forEach(slot => {
      scheduleGrid[day][slot] = '';
    });
  });

  // Fill the grid with class names
  schedules.forEach(schedule => {
    if (schedule.classes) {
      scheduleGrid[schedule.day_of_week][schedule.time_slot] = schedule.classes.name;
    }
  });

  return {
    gradeName,
    grid: scheduleGrid,
    generatedAt: new Date().toLocaleString()
  };
}

// Hook to manually initialize schedule slots for a grade (for admin use)
export function useInitializeScheduleSlots() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gradeId: string) => {
      await initializeScheduleSlots(gradeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Schedule slots initialized",
        description: "All schedule slots have been created for this grade."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error initializing schedule slots",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
