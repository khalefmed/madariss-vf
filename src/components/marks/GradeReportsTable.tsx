import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Loader2, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GradeReportsTableProps {
  gradeId: string;
  quarterId: string;
  onStudentSelect: (student: any) => void;
}

export default function GradeReportsTable({ gradeId, quarterId, onStudentSelect }: GradeReportsTableProps) {
  const { t } = useLanguage();
  const { data: students, isLoading } = useQuery({
    queryKey: ['grade-reports', gradeId, quarterId],
    queryFn: async () => {
      if (!gradeId) return [];

      let query = supabase
        .from('students')
        .select(`
          *,
          grade_levels(name),
          student_quarter_averages(*),
          student_yearly_averages(*)
        `)
        .eq('grade_id', gradeId)
        .eq('is_active', true)
        .order('last_name');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching grade reports:', error);
        throw error;
      }

      return data;
    },
    enabled: !!gradeId
  });

  const getAverageColor = (average: number | null) => {
    if (average === null) return 'text-gray-500';
    if (average >= 16) return 'text-green-600';
    if (average >= 12) return 'text-blue-600';
    if (average >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatAverage = (average: number | null) => {
    return average ? average.toFixed(2) : t('gradeReportsTable.na');
  };

  const getDisplayAverage = (student: any) => {
    if (quarterId === 'yearly') {
      return student.student_yearly_averages?.[0]?.final_yearly_average;
    } else if (quarterId === 'all') {
      // Show latest quarter average
      const latestQuarter = student.student_quarter_averages?.[0];
      return latestQuarter?.quarter_average;
    } else {
      // Show specific quarter average
      const quarterAverage = student.student_quarter_averages?.find(
        (qa: any) => qa.academic_quarter_id === quarterId
      );
      return quarterAverage?.quarter_average;
    }
  };

  if (isLoading) {
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
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('gradeReportsTable.noStudentsFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('gradeReportsTable.noStudentsDescription')}
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
          <TrendingUp className="h-5 w-5" />
          <span className="hidden sm:inline">{t('gradeReportsTable.title')}</span>
          <span className="sm:hidden">{t('gradeReportsTable.titleShort')}</span>
        </CardTitle>
        <CardDescription className="hidden sm:block">
          {t('gradeReportsTable.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">{t('gradeReportsTable.table.student')}</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">{t('gradeReportsTable.table.studentId')}</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('gradeReportsTable.table.group')}</TableHead>
                <TableHead className="text-xs sm:text-sm">{t('gradeReportsTable.table.average')}</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('gradeReportsTable.table.status')}</TableHead>
                <TableHead className="text-xs sm:text-sm w-20 sm:w-auto">{t('gradeReportsTable.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const average = getDisplayAverage(student);
                return (
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
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{student.group_name}</TableCell>
                    <TableCell className={`${getAverageColor(average)} text-xs sm:text-sm`}>
                      <strong>{formatAverage(average)}</strong>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={student.is_active ? 'default' : 'secondary'} className="text-xs">
                        {t(`gradeReportsTable.status.${student.is_active ? 'active' : 'inactive'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStudentSelect(student)}
                        className="w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
                      >
                        <Eye className="h-3 w-3 sm:mr-2" />
                        <span className="hidden sm:inline">{t('gradeReportsTable.viewDetails')}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}