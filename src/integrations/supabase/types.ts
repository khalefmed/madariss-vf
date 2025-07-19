export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academic_quarters: {
        Row: {
          academic_year_id: string
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          is_completed: boolean
          name: string
          quarter: Database["public"]["Enums"]["academic_quarter"]
          start_date: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_completed?: boolean
          name: string
          quarter: Database["public"]["Enums"]["academic_quarter"]
          start_date: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_completed?: boolean
          name?: string
          quarter?: Database["public"]["Enums"]["academic_quarter"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_quarters_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          is_current: boolean
          school_id: string
          start_date: string
          updated_at: string
          year_name: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_current?: boolean
          school_id: string
          start_date: string
          updated_at?: string
          year_name: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_current?: boolean
          school_id?: string
          start_date?: string
          updated_at?: string
          year_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          school_id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          school_id: string
          status: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          school_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string | null
          coefficient: number | null
          created_at: string
          grade_id: string | null
          grade_level: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          coefficient?: number | null
          created_at?: string
          grade_id?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          coefficient?: number | null
          created_at?: string
          grade_id?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          created_at: string
          currency: string | null
          display_order: number
          id: string
          is_active: boolean
          monthly_price: number | null
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          assignment_name: string
          class_id: string
          created_at: string
          created_by: string | null
          date_assigned: string | null
          date_due: string | null
          grade: number | null
          id: string
          max_grade: number
          notes: string | null
          school_id: string
          student_id: string
          subject_id: string
        }
        Insert: {
          assignment_name: string
          class_id: string
          created_at?: string
          created_by?: string | null
          date_assigned?: string | null
          date_due?: string | null
          grade?: number | null
          id?: string
          max_grade?: number
          notes?: string | null
          school_id: string
          student_id: string
          subject_id: string
        }
        Update: {
          assignment_name?: string
          class_id?: string
          created_at?: string
          created_by?: string | null
          date_assigned?: string | null
          date_due?: string | null
          grade?: number | null
          id?: string
          max_grade?: number
          notes?: string | null
          school_id?: string
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          academic_year_id: string | null
          class_id: string | null
          created_at: string
          day_of_week: string
          grade_id: string
          id: string
          is_active: boolean
          school_id: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string
          day_of_week: string
          grade_id: string
          id?: string
          is_active?: boolean
          school_id: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string
          day_of_week?: string
          grade_id?: string
          id?: string
          is_active?: boolean
          school_id?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_users: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          joined_at: string | null
          role: Database["public"]["Enums"]["school_role"]
          school_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          role: Database["public"]["Enums"]["school_role"]
          school_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string | null
          role?: Database["public"]["Enums"]["school_role"]
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          is_active: boolean
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_grade_history: {
        Row: {
          academic_year: string
          academic_year_id: string | null
          created_at: string
          enrolled_at: string
          grade_id: string
          group_name: string
          id: string
          is_active: boolean
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          academic_year_id?: string | null
          created_at?: string
          enrolled_at?: string
          grade_id: string
          group_name?: string
          id?: string
          is_active?: boolean
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          academic_year_id?: string | null
          created_at?: string
          enrolled_at?: string
          grade_id?: string
          group_name?: string
          id?: string
          is_active?: boolean
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_grade_history_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grade_history_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grade_history_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grade_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_marks: {
        Row: {
          academic_quarter_id: string
          class_id: string
          created_at: string
          entered_at: string | null
          id: string
          mark: number | null
          mark_type: Database["public"]["Enums"]["mark_type"]
          max_mark: number
          school_id: string
          student_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_quarter_id: string
          class_id: string
          created_at?: string
          entered_at?: string | null
          id?: string
          mark?: number | null
          mark_type: Database["public"]["Enums"]["mark_type"]
          max_mark?: number
          school_id: string
          student_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_quarter_id?: string
          class_id?: string
          created_at?: string
          entered_at?: string | null
          id?: string
          mark?: number | null
          mark_type?: Database["public"]["Enums"]["mark_type"]
          max_mark?: number
          school_id?: string
          student_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_marks_academic_quarter_id_fkey"
            columns: ["academic_quarter_id"]
            isOneToOne: false
            referencedRelation: "academic_quarters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_marks_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_monthly_charges: {
        Row: {
          charge_month: string
          created_at: string
          discount_percentage: number | null
          final_amount: number
          grade_id: string
          id: string
          original_amount: number
          processed_at: string | null
          school_id: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          charge_month: string
          created_at?: string
          discount_percentage?: number | null
          final_amount: number
          grade_id: string
          id?: string
          original_amount: number
          processed_at?: string | null
          school_id: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          charge_month?: string
          created_at?: string
          discount_percentage?: number | null
          final_amount?: number
          grade_id?: string
          id?: string
          original_amount?: number
          processed_at?: string | null
          school_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_monthly_charges_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_monthly_charges_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_monthly_charges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_payments: {
        Row: {
          academic_year_id: string | null
          amount: number
          created_at: string
          created_by: string | null
          id: string
          label: string
          notes: string | null
          payment_date: string
          payment_method: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_payments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_quarter_averages: {
        Row: {
          academic_quarter_id: string
          assessment_average: number | null
          created_at: string
          exam_average: number | null
          grade_id: string
          id: string
          quarter_average: number | null
          school_id: string
          student_id: string
          total_coefficient: number | null
          updated_at: string
        }
        Insert: {
          academic_quarter_id: string
          assessment_average?: number | null
          created_at?: string
          exam_average?: number | null
          grade_id: string
          id?: string
          quarter_average?: number | null
          school_id: string
          student_id: string
          total_coefficient?: number | null
          updated_at?: string
        }
        Update: {
          academic_quarter_id?: string
          assessment_average?: number | null
          created_at?: string
          exam_average?: number | null
          grade_id?: string
          id?: string
          quarter_average?: number | null
          school_id?: string
          student_id?: string
          total_coefficient?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_quarter_averages_academic_quarter_id_fkey"
            columns: ["academic_quarter_id"]
            isOneToOne: false
            referencedRelation: "academic_quarters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_quarter_averages_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_quarter_averages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_quarter_averages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_yearly_averages: {
        Row: {
          academic_year_id: string
          assessment_yearly_average: number | null
          created_at: string
          exam_yearly_average: number | null
          final_yearly_average: number | null
          grade_id: string
          id: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          assessment_yearly_average?: number | null
          created_at?: string
          exam_yearly_average?: number | null
          final_yearly_average?: number | null
          grade_id: string
          id?: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          assessment_yearly_average?: number | null
          created_at?: string
          exam_yearly_average?: number | null
          final_yearly_average?: number | null
          grade_id?: string
          id?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_yearly_averages_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_yearly_averages_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_yearly_averages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_yearly_averages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          balance: number | null
          class_id: string | null
          created_at: string
          date_of_birth: string | null
          discount_percentage: number | null
          email: string | null
          enrollment_date: string | null
          first_name: string
          grade_id: string | null
          group_name: string
          id: string
          is_active: boolean
          last_name: string
          national_id: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          school_id: string
          sex: string | null
          student_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          discount_percentage?: number | null
          email?: string | null
          enrollment_date?: string | null
          first_name: string
          grade_id?: string | null
          group_name?: string
          id?: string
          is_active?: boolean
          last_name: string
          national_id?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          school_id: string
          sex?: string | null
          student_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          discount_percentage?: number | null
          email?: string | null
          enrollment_date?: string | null
          first_name?: string
          grade_id?: string | null
          group_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          national_id?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          school_id?: string
          sex?: string | null
          student_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          school_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          school_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string
          currency: string
          hourly_salary: number
          id: string
          is_active: boolean
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          currency?: string
          hourly_salary: number
          id?: string
          is_active?: boolean
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          currency?: string
          hourly_salary?: number
          id?: string
          is_active?: boolean
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          national_number: string
          nationality: string | null
          phone: string | null
          school_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          national_number: string
          nationality?: string | null
          phone?: string | null
          school_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          national_number?: string
          nationality?: string | null
          phone?: string | null
          school_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_student_quarter_average: {
        Args: { p_student_id: string; p_quarter_id: string }
        Returns: undefined
      }
      calculate_student_yearly_average: {
        Args: { p_student_id: string; p_academic_year_id: string }
        Returns: undefined
      }
      generate_student_id: {
        Args: { school_uuid: string }
        Returns: string
      }
      get_user_school_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      process_monthly_charges: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_role_in_school: {
        Args: {
          user_uuid: string
          school_uuid: string
          required_role: Database["public"]["Enums"]["school_role"]
        }
        Returns: boolean
      }
      user_is_teacher_for_class: {
        Args: { user_uuid: string; class_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      academic_quarter: "Q1" | "Q2" | "Q3"
      mark_type: "assessment" | "exam"
      school_role:
        | "super_admin"
        | "admin"
        | "teacher"
        | "student"
        | "parent"
        | "academic_director"
        | "accountant"
        | "supervisor"
      subscription_status: "active" | "inactive" | "cancelled" | "past_due"
      subscription_tier: "basic" | "premium" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      academic_quarter: ["Q1", "Q2", "Q3"],
      mark_type: ["assessment", "exam"],
      school_role: [
        "super_admin",
        "admin",
        "teacher",
        "student",
        "parent",
        "academic_director",
        "accountant",
        "supervisor",
      ],
      subscription_status: ["active", "inactive", "cancelled", "past_due"],
      subscription_tier: ["basic", "premium", "enterprise"],
    },
  },
} as const
