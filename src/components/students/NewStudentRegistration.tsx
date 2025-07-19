import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { type GradeLevel } from '@/hooks/useGrades';
import { useLanguage } from '@/contexts/LanguageContext';

const studentRegistrationSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  date_of_birth: z.string().optional(),
  sex: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  national_id: z.string().optional(),
  enrollment_date: z.string().optional(),
  grade_id: z.string(),
  group_name: z.string().optional(),
  parent_name: z.string().optional(),
  parent_email: z.string().email().optional().or(z.literal("")),
  parent_phone: z.string().optional(),
  discount_percentage: z.number(),
});

interface NewStudentRegistrationProps {
  grades: GradeLevel[] | undefined;
  onStudentAdded: (student: any) => void;
  onClose: () => void;
}

export default function NewStudentRegistration({ grades, onStudentAdded, onClose }: NewStudentRegistrationProps) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof studentRegistrationSchema>>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      date_of_birth: "",
      sex: "",
      address: "",
      phone: "",
      national_id: "",
      enrollment_date: "",
      grade_id: "",
      group_name: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      discount_percentage: 0,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      const { data: schoolUsers } = await supabase
        .from('school_users')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!schoolUsers) throw new Error('User not associated with any school');

      const { data: studentIdData, error: studentIdError } = await supabase
        .rpc('generate_student_id', { school_uuid: schoolUsers.school_id });

      if (studentIdError) throw studentIdError;

      const studentData = {
        ...values,
        school_id: schoolUsers.school_id,
        student_id: studentIdData,
        discount_percentage: values.discount_percentage || 0,
        balance: 0,
        is_active: true
      };

      const { data: student, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t("studentForm.success"),
        description: `${student.first_name} ${student.last_name}`
      });

      form.reset();
      onStudentAdded(student);
      onClose();
    } catch (error: any) {
      toast({
        title: t("studentForm.error"),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('studentForm.personalInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.firstName')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.lastName')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.email')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date_of_birth" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.dateOfBirth')}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.sex')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('studentForm.sex')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t('studentForm.male')}</SelectItem>
                    <SelectItem value="female">{t('studentForm.female')}</SelectItem>
                    <SelectItem value="other">{t('studentForm.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.phone')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('studentForm.address')}</FormLabel>
              <FormControl><Textarea {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="national_id" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('studentForm.nationalId')}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('studentForm.academicInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="enrollment_date" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.enrollmentDate')}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="grade_id" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.gradeLevel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('studentForm.gradeLevel')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades?.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="discount_percentage" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.discountPercentage')}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.01" placeholder="0"
                         onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                         value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="group_name" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('studentForm.groupName')}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('studentForm.parentInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="parent_name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.parentName')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="parent_email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentForm.parentEmail')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="parent_phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('studentForm.parentPhone')}</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" disabled={!grades || grades.length === 0 || form.formState.isSubmitting}>
          {t('studentForm.submit')}
        </Button>
      </form>
    </Form>
  );
}