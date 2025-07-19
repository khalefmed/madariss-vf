import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudentsInClass, useStudentMarks, useUpsertStudentMark } from '@/hooks/useStudentMarks';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import QuarterSelect from './QuarterSelect';

type AcademicQuarter = {
  id: string;
  quarter: 'Q1' | 'Q2' | 'Q3';
  name: string;
  is_active: boolean;
};

interface TeacherMarksEntryProps {
  classId: string;
  selectedQuarter?: AcademicQuarter;
  isAdminView?: boolean;
}

export default function TeacherMarksEntry({ classId, selectedQuarter, isAdminView = false }: TeacherMarksEntryProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const { data: students, isLoading: studentsLoading } = useStudentsInClass(classId);
  
  const [currentQuarter, setCurrentQuarter] = useState<string>(selectedQuarter?.id || '');
  const { data: existingMarks, isLoading: marksLoading } = useStudentMarks(classId, currentQuarter);
  const upsertMarkMutation = useUpsertStudentMark();

  const [marks, setMarks] = useState<Record<string, { assessment?: number; exam?: number }>>({});
  const [teacherId, setTeacherId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');

  // Get teacher ID and school ID
  useEffect(() => {
    async function getTeacherInfo() {
      if (!user) return;

      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id, school_id')
        .eq('user_id', user.id)
        .single();

      if (teacherData) {
        setTeacherId(teacherData.id);
        setSchoolId(teacherData.school_id);
      }
    }

    getTeacherInfo();
  }, [user]);

  // Initialize marks from existing data
  useEffect(() => {
    if (existingMarks && students) {
      const marksMap: Record<string, { assessment?: number; exam?: number }> = {};
      
      students.forEach(student => {
        const studentAssessment = existingMarks.find(
          m => m.student_id === student.id && m.mark_type === 'assessment'
        );
        const studentExam = existingMarks.find(
          m => m.student_id === student.id && m.mark_type === 'exam'
        );

        marksMap[student.id] = {
          assessment: studentAssessment?.mark || undefined,
          exam: studentExam?.mark || undefined,
        };
      });

      setMarks(marksMap);
    }
  }, [existingMarks, students]);

  const handleMarkChange = (studentId: string, markType: 'assessment' | 'exam', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [markType]: numValue
      }
    }));
  };

  const handleSaveMark = async (studentId: string, markType: 'assessment' | 'exam') => {
    if (!teacherId || !schoolId || !currentQuarter) {
      toast.error(t('teacherMarksEntry.error.teacherInfoMissing'));
      return;
    }

    const mark = marks[studentId]?.[markType];
    if (mark !== undefined && (mark < 0 || mark > 20)) {
      toast.error(t('teacherMarksEntry.error.invalidMark'));
      return;
    }

    await upsertMarkMutation.mutateAsync({
      studentId,
      classId,
      quarterIds: currentQuarter,
      markType,
      mark: mark || null,
      teacherId,
      schoolId
    });
  };

  const getQuarterBadgeColor = (quarter: string) => {
    switch (quarter) {
      case 'Q1': return 'bg-blue-100 text-blue-800';
      case 'Q2': return 'bg-green-100 text-green-800';
      case 'Q3': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (studentsLoading || marksLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('teacherMarksEntry.noStudentsFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('teacherMarksEntry.noStudentsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="h-5 w-5" />
          <span className="hidden sm:inline">{t('teacherMarksEntry.title')}</span>
          <span className="sm:hidden">{t('teacherMarksEntry.titleShort')}</span>
        </CardTitle>
        <CardDescription className="hidden sm:block">
          {t('teacherMarksEntry.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Quarter Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('teacherMarksEntry.selectQuarter')}</label>
          <QuarterSelect
            value={currentQuarter}
            onValueChange={setCurrentQuarter}
            placeholder={t('teacherMarksEntry.selectQuarterPlaceholder')}
          />
        </div>

        {currentQuarter && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">{t('teacherMarksEntry.table.student')}</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">{t('teacherMarksEntry.table.studentId')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('teacherMarksEntry.table.assessment')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('teacherMarksEntry.table.exam')}</TableHead>
                  <TableHead className="text-xs sm:text-sm w-20 sm:w-auto">{t('teacherMarksEntry.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      <div className="max-w-[120px] sm:max-w-none">
                        <div className="sm:hidden">
                          {student.first_name} {student.last_name.charAt(0)}.
                        </div>
                        <div className="hidden sm:block">
                          {student.first_name} {student.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">{student.student_id}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={marks[student.id]?.assessment || ''}
                        onChange={(e) => handleMarkChange(student.id, 'assessment', e.target.value)}
                        className="w-16 sm:w-20 text-xs sm:text-sm"
                        placeholder={t('teacherMarksEntry.markPlaceholder')}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={marks[student.id]?.exam || ''}
                        onChange={(e) => handleMarkChange(student.id, 'exam', e.target.value)}
                        className="w-16 sm:w-20 text-xs sm:text-sm"
                        placeholder={t('teacherMarksEntry.markPlaceholder')}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveMark(student.id, 'assessment')}
                          disabled={upsertMarkMutation.isPending}
                          className="w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
                        >
                          <Save className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1">{t('teacherMarksEntry.saveAssessment')}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveMark(student.id, 'exam')}
                          disabled={upsertMarkMutation.isPending}
                          className="w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
                        >
                          <Save className="h-3 w-3" />
                          <span className="hidden sm:inline ml-1">{t('teacherMarksEntry.saveExam')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}