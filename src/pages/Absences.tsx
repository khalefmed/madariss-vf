
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AbsencesTable from '@/components/absences/AbsencesTable';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Absences() {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const { t } = useLanguage();
  const isStudent = userRole?.role === 'student';

  // Fetch current student's absence history if user is a student
  const { data: studentAbsences, isLoading: absencesLoading } = useQuery({
    queryKey: ['student-absences', user?.id],
    queryFn: async () => {
      if (!user || !isStudent) return [];

      // First get the student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (studentError) {
        console.error('Error fetching student record:', studentError);
        return [];
      }

      if (!studentData) {
        console.log('No student record found for user:', user.id);
        return [];
      }

      // Get the student's absences
      const { data: absencesData, error: absencesError } = await supabase
        .from('attendance')
        .select(`
          *,
          classes(
            id,
            name
          )
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'absent')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (absencesError) {
        console.error('Error fetching student absences:', absencesError);
        throw absencesError;
      }

      console.log('Student absences data:', absencesData);
      return absencesData || [];
    },
    enabled: !!user && isStudent
  });

  // Student view - show their own absence history
  if (isStudent) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{t('absences.myAbsenceHistory')}</h2>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                {t('absences.viewAttendance')}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('absences.absenceRecords')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('absences.allRecordedAbsences')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {absencesLoading ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-pulse text-sm sm:text-base">{t('common.loading')}</div>
                </div>
              ) : studentAbsences && studentAbsences.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t('absences.totalAbsences')}: {studentAbsences.length}
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full px-4 sm:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap text-xs sm:text-sm">{t('absences.date')}</TableHead>
                            <TableHead className="whitespace-nowrap text-xs sm:text-sm">{t('absences.class')}</TableHead>
                            <TableHead className="whitespace-nowrap text-xs sm:text-sm">{t('common.status')}</TableHead>
                            <TableHead className="whitespace-nowrap text-xs sm:text-sm">{t('absences.notes')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentAbsences.map((absence) => (
                            <TableRow key={absence.id}>
                              <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                                {format(new Date(absence.date), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {absence.classes?.name || t('absences.unknownClass')}
                              </TableCell>
                              <TableCell>
                <Badge variant="destructive" className="text-xs">
                  {t('common.absent')}
                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {absence.notes || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('absences.noAbsencesFound')}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {t('absences.perfectAttendance')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // For non-students, show the regular AbsencesTable component
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AbsencesTable />
      </div>
    </DashboardLayout>
  );
}
