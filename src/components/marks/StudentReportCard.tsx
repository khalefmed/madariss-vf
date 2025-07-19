import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Download, User, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentReportCardProps {
  student: any;
  onClose: () => void;
}

export default function StudentReportCard({ student, onClose }: StudentReportCardProps) {
  const { t } = useLanguage();

  const getAverageColor = (average: number | null) => {
    if (average === null) return 'text-gray-500';
    if (average >= 16) return 'text-green-600';
    if (average >= 12) return 'text-blue-600';
    if (average >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatAverage = (average: number | null) => {
    return average ? average.toFixed(2) : t('studentReportCard.na');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-lg sm:text-xl">
              <span className="sm:hidden">{student.first_name} {student.last_name.charAt(0)}.</span>
              <span className="hidden sm:block">{student.first_name} {student.last_name}</span>
            </CardTitle>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('studentReportCard.exportPDF')}</span>
              <span className="sm:hidden">{t('studentReportCard.exportPDFShort')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {t('studentReportCard.studentInfo', {
            studentId: student.student_id,
            grade: student.grade_levels?.name || t('studentReportCard.na')
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Student Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{t('studentReportCard.nationalId')}</p>
            <p className="text-xs sm:text-sm">{student.national_id || t('studentReportCard.na')}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{t('studentReportCard.dateOfBirth')}</p>
            <p className="text-xs sm:text-sm">
              {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : t('studentReportCard.na')}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{t('studentReportCard.group')}</p>
            <p className="text-xs sm:text-sm">{student.group_name || t('studentReportCard.na')}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{t('studentReportCard.status')}</p>
            <Badge variant={student.is_active ? 'default' : 'secondary'} className="text-xs">
              {t(`studentReportCard.statuses.${student.is_active ? 'active' : 'inactive'}`)}
            </Badge>
          </div>
        </div>

        {/* Quarter Averages */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3">{t('studentReportCard.quarterAverages')}</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">{t('studentReportCard.table.quarter')}</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('studentReportCard.table.assessmentAvg')}</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('studentReportCard.table.examAvg')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('studentReportCard.table.quarterAvg')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.student_quarter_averages?.map((qa: any) => (
                  <TableRow key={qa.id}>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge className="text-xs">{t('studentReportCard.quarterBadge', { quarterId: qa.academic_quarter_id })}</Badge>
                    </TableCell>
                    <TableCell className={`${getAverageColor(qa.assessment_average)} hidden sm:table-cell text-xs sm:text-sm`}>
                      {formatAverage(qa.assessment_average)}
                    </TableCell>
                    <TableCell className={`${getAverageColor(qa.exam_average)} hidden sm:table-cell text-xs sm:text-sm`}>
                      {formatAverage(qa.exam_average)}
                    </TableCell>
                    <TableCell className={`${getAverageColor(qa.quarter_average)} text-xs sm:text-sm`}>
                      <strong>{formatAverage(qa.quarter_average)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Yearly Average */}
        {student.student_yearly_averages?.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3">{t('studentReportCard.yearlyPerformance')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.student_yearly_averages.map((ya: any) => (
                <div key={ya.id} className="text-center p-3 sm:p-4 border rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500">{t('studentReportCard.assessmentYearly')}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${getAverageColor(ya.assessment_yearly_average)}`}>
                    {formatAverage(ya.assessment_yearly_average)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}