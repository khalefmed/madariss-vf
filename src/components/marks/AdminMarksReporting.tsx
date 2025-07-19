import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGrades } from '@/hooks/useGrades';
import { useAcademicQuarters } from '@/hooks/useAcademicQuarters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, FileText, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import StudentReportCard from '@/components/marks/StudentReportCard';
import GradeReportsTable from '@/components/marks/GradeReportsTable';

export default function AdminMarksReporting() {
  const { t } = useLanguage();
  const { data: grades } = useGrades();
  const { data: quarters } = useAcademicQuarters();
  const [searchType, setSearchType] = useState<'student_id' | 'national_id'>('student_id');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'search' | 'browse'>('search');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          grade_levels(name),
          student_quarter_averages(*),
          student_yearly_averages(*)
        `)
        .eq(searchType, searchTerm.trim())
        .single();

      if (error) throw error;
      setSelectedStudent(data);
    } catch (error) {
      console.error('Error searching for student:', error);
      toast.error(t('adminMarksReporting.studentNotFound'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search/Browse Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            <span className="hidden sm:inline">{t('adminMarksReporting.title')}</span>
            <span className="sm:hidden">{t('adminMarksReporting.titleShort')}</span>
          </CardTitle>
          <CardDescription className="hidden sm:block">
            {t('adminMarksReporting.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-end">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'search' ? 'default' : 'outline'}
                onClick={() => setViewMode('search')}
                className="flex-1 sm:flex-none"
                size="sm"
              >
                <Search className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('adminMarksReporting.searchStudent')}</span>
                <span className="sm:hidden">{t('adminMarksReporting.searchShort')}</span>
              </Button>
              <Button
                variant={viewMode === 'browse' ? 'default' : 'outline'}
                onClick={() => setViewMode('browse')}
                className="flex-1 sm:flex-none"
                size="sm"
              >
                <Users className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('adminMarksReporting.browseByGrade')}</span>
                <span className="sm:hidden">{t('adminMarksReporting.browseShort')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Search */}
      {viewMode === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('adminMarksReporting.searchStudentTitle')}</CardTitle>
            <CardDescription className="hidden sm:block">
              {t('adminMarksReporting.searchStudentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-end">
              <div className="w-full sm:flex-1">
                <Select value={searchType} onValueChange={(value: 'student_id' | 'national_id') => setSearchType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('adminMarksReporting.selectSearchType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student_id">{t('adminMarksReporting.searchType.student_id')}</SelectItem>
                    <SelectItem value="national_id">{t('adminMarksReporting.searchType.national_id')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:flex-2">
                <Input
                  placeholder={t('adminMarksReporting.searchPlaceholder', { searchType: t(`adminMarksReporting.searchType.${searchType}`) })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                <span className="sm:hidden">{t('adminMarksReporting.searchShort')}</span>
                <span className="hidden sm:inline">{t('adminMarksReporting.searchShort')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Browse */}
      {viewMode === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('adminMarksReporting.browseByGradeTitle')}</CardTitle>
            <CardDescription className="hidden sm:block">
              {t('adminMarksReporting.browseByGradeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-end">
              <div className="w-full sm:flex-1">
                <label className="text-sm font-medium block mb-1 sm:hidden">{t('adminMarksReporting.grade')}</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('adminMarksReporting.selectGrade')} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades?.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:flex-1">
                <label className="text-sm font-medium block mb-1 sm:hidden">{t('adminMarksReporting.quarter')}</label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('adminMarksReporting.selectQuarter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('adminMarksReporting.quarters.all')}</SelectItem>
                    <SelectItem value="yearly">{t('adminMarksReporting.quarters.yearly')}</SelectItem>
                    {quarters?.map((quarter) => (
                      <SelectItem key={quarter.id} value={quarter.id}>
                        {quarter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Report Card */}
      {selectedStudent && (
        <StudentReportCard 
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Grade Reports Table */}
      {viewMode === 'browse' && selectedGrade && (
        <GradeReportsTable 
          gradeId={selectedGrade}
          quarterId={selectedQuarter}
          onStudentSelect={setSelectedStudent}
        />
      )}
    </div>
  );
}