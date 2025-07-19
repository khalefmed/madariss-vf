import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStudentAllMarks } from '@/hooks/useStudentAllMarks';
import { useStudentOwnMarks } from '@/hooks/useStudentOwnMarks';
import { Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import QuarterSelect from './QuarterSelect';

interface StudentMarksViewProps {
  quarterId?: string;
  quarterName?: string;
}

export default function StudentMarksView({ quarterId, quarterName }: StudentMarksViewProps) {
  const [selectedQuarter, setSelectedQuarter] = useState<string>(quarterId || 'all');
  const { data: allMarks, isLoading: allMarksLoading, error: allMarksError } = useStudentAllMarks();
  const { data: quarterMarks, isLoading: quarterMarksLoading, error: quarterMarksError } = useStudentOwnMarks(
    selectedQuarter !== 'all' ? selectedQuarter : undefined
  );
  const { t } = useLanguage();

  const isLoading = selectedQuarter === 'all' ? allMarksLoading : quarterMarksLoading;
  const error = selectedQuarter === 'all' ? allMarksError : quarterMarksError;
  const marks = selectedQuarter === 'all' ? allMarks : quarterMarks;

  const getMarkColor = (mark: number | null, maxMark: number = 20) => {
    if (mark === null) return 'text-gray-500';
    const percentage = (mark / maxMark) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMark = (mark: number | null, maxMark: number = 20) => {
    return mark !== null ? `${mark}/${maxMark}` : t('marks.na');
  };

  const getQuarterBadgeColor = (quarter: string) => {
    switch (quarter) {
      case 'Q1': return 'bg-blue-100 text-blue-800';
      case 'Q2': return 'bg-green-100 text-green-800';
      case 'Q3': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-semibold text-red-900">{t('marks.error.title')}</h3>
            <p className="mt-1 text-sm text-red-500">{t('marks.error.description')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marks || marks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('marks.noMarks.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('marks.noMarks.description')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group marks by quarter and class for "all" view
  if (selectedQuarter === 'all') {
    type ClassData = {
      className: string;
      coefficient: number | null;
      assessment: any;
      exam: any;
    };

    type QuarterData = {
      quarterName: string;
      quarter: 'Q1' | 'Q2' | 'Q3';
      classes: Record<string, ClassData>;
    };

    const marksByQuarterAndClass = marks.reduce((acc, mark) => {
      const quarterId = mark.academic_quarter_id;
      const classId = mark.class_id;
      
      if (!acc[quarterId]) {
        acc[quarterId] = {
          quarterName: mark.academic_quarters.name,
          quarter: mark.academic_quarters.quarter,
          classes: {}
        };
      }
      
      if (!acc[quarterId].classes[classId]) {
        acc[quarterId].classes[classId] = {
          className: mark.classes.name,
          coefficient: mark.classes.coefficient,
          assessment: null,
          exam: null
        };
      }
      
      if (mark.mark_type === 'assessment') {
        acc[quarterId].classes[classId].assessment = mark;
      } else {
        acc[quarterId].classes[classId].exam = mark;
      }
      
      return acc;
    }, {} as Record<string, QuarterData>);

    return (
      <div className="space-y-6">
        {/* Quarter Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <GraduationCap className="h-5 w-5" />
              {t('marks.yourMarks')}
            </CardTitle>
            <CardDescription>{t('marks.selectQuarterDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <QuarterSelect
              value={selectedQuarter}
              onValueChange={setSelectedQuarter}
              placeholder={t('marks.selectQuarterPlaceholder')}
              showAll={true}
            />
          </CardContent>
        </Card>

        {Object.entries(marksByQuarterAndClass).map(([quarterId, quarterData]) => (
          <Card key={quarterId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <Badge className={getQuarterBadgeColor(quarterData.quarter)}>
                  {t('marks.quarterBadge', { quarterId: quarterData.quarter })}
                </Badge>
                <span className="hidden sm:inline">{quarterData.quarterName}</span>
                <span className="sm:hidden">{t('marks.quarterBadge', { quarterId: quarterData.quarter })}</span>
              </CardTitle>
              <CardDescription className="hidden sm:block">
                {t('marks.quarterMarksDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">{t('marks.table.subject')}</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('marks.table.coefficient')}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t('marks.table.assessment')}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t('marks.table.exam')}</TableHead>
                      <TableHead className="text-xs sm:text-sm">{t('marks.table.average')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(quarterData.classes).map(([classId, classData]) => {
                      const assessmentMark = classData.assessment?.mark;
                      const examMark = classData.exam?.mark;
                      const average = assessmentMark !== null && examMark !== null 
                        ? (assessmentMark + examMark) / 2 
                        : null;

                      return (
                        <TableRow key={classId}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div className="max-w-[100px] sm:max-w-none truncate">
                              {classData.className}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {classData.coefficient || 1}
                            </Badge>
                          </TableCell>
                          <TableCell className={`${getMarkColor(assessmentMark)} text-xs sm:text-sm`}>
                            {formatMark(assessmentMark, classData.assessment?.max_mark || 20)}
                          </TableCell>
                          <TableCell className={`${getMarkColor(examMark)} text-xs sm:text-sm`}>
                            {formatMark(examMark, classData.exam?.max_mark || 20)}
                          </TableCell>
                          <TableCell className={`${getMarkColor(average)} text-xs sm:text-sm`}>
                            <strong>
                              {average !== null ? average.toFixed(2) : t('marks.na')}
                            </strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Single quarter view
  const marksByClass = marks.reduce((acc, mark) => {
    const classId = mark.class_id;
    
    if (!acc[classId]) {
      acc[classId] = {
        className: mark.classes.name,
        coefficient: mark.classes.coefficient,
        assessment: null,
        exam: null
      };
    }
    
    if (mark.mark_type === 'assessment') {
      acc[classId].assessment = mark;
    } else {
      acc[classId].exam = mark;
    }
    
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quarter Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GraduationCap className="h-5 w-5" />
            {t('marks.yourMarks')}
          </CardTitle>
          <CardDescription>{t('marks.selectQuarterDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <QuarterSelect
            value={selectedQuarter}
            onValueChange={setSelectedQuarter}
            placeholder={t('marks.selectQuarterPlaceholder')}
            showAll={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            <GraduationCap className="h-5 w-5" />
            <span className="hidden sm:inline">{t('marks.quarterMarksTitle')}</span>
            <span className="sm:hidden">{t('marks.quarterMarksTitleShort')}</span>
          </CardTitle>
          <CardDescription className="hidden sm:block">
            {t('marks.quarterMarksDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">{t('marks.table.subject')}</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">{t('marks.table.coefficient')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('marks.table.assessment')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('marks.table.exam')}</TableHead>
                  <TableHead className="text-xs sm:text-sm">{t('marks.table.average')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(marksByClass).map(([classId, classData]) => {
                  const assessmentMark = classData.assessment?.mark;
                  const examMark = classData.exam?.mark;
                  const average = assessmentMark !== null && examMark !== null 
                    ? (assessmentMark + examMark) / 2 
                    : null;

                  return (
                    <TableRow key={classId}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="max-w-[100px] sm:max-w-none truncate">
                          {classData.className}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {classData.coefficient || 1}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${getMarkColor(assessmentMark)} text-xs sm:text-sm`}>
                        {formatMark(assessmentMark, classData.assessment?.max_mark || 20)}
                      </TableCell>
                      <TableCell className={`${getMarkColor(examMark)} text-xs sm:text-sm`}>
                        {formatMark(examMark, classData.exam?.max_mark || 20)}
                      </TableCell>
                      <TableCell className={`${getMarkColor(average)} text-xs sm:text-sm`}>
                        <strong>
                          {average !== null ? average.toFixed(2) : t('marks.na')}
                        </strong>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}