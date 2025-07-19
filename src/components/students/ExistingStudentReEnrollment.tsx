
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, User, Clock, GraduationCap, Loader2 } from 'lucide-react';
import { useStudentByNationalId, useUpdateStudentGrade, type Student } from '@/hooks/useStudents';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Tables } from '@/integrations/supabase/types';

type Grade = Tables<'grade_levels'>;

interface ExistingStudentReEnrollmentProps {
  grades?: Grade[];
  onStudentAdded?: (student: Student) => void;
}

export default function ExistingStudentReEnrollment({ 
  grades, 
  onStudentAdded 
}: ExistingStudentReEnrollmentProps) {
  const [nationalId, setNationalId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);

  const searchStudentMutation = useStudentByNationalId();
  const updateStudentGradeMutation = useUpdateStudentGrade();
  const { data: academicYears } = useAcademicYears();
  const { t } = useLanguage();

  const currentAcademicYear = academicYears?.find(year => year.is_current);
  const hasCurrentAcademicYear = !!currentAcademicYear;

  const handleSearch = async () => {
    if (!nationalId.trim() || !hasCurrentAcademicYear) return;
    
    try {
      const student = await searchStudentMutation.mutateAsync(nationalId.trim());
      setFoundStudent(student);
      if (!student) {
        console.log('Student not found');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      setFoundStudent(null);
    }
  };

  const handleReEnroll = async () => {
    if (!foundStudent || !selectedGrade) return;

    try {
      const updatedStudent = await updateStudentGradeMutation.mutateAsync({
        studentId: foundStudent.id,
        gradeId: selectedGrade
      });
      onStudentAdded?.(updatedStudent);
      
      // Reset form
      setNationalId('');
      setSelectedGrade('');
      setFoundStudent(null);
    } catch (error) {
      console.error('Error re-enrolling student:', error);
    }
  };

  if (!hasCurrentAcademicYear) {
    return (
      <Alert>
        <AlertDescription>
          {t('studentReEnrollment.noCurrentYear')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <Label className="text-sm font-medium text-blue-700">
          {t('studentForm.academicYear')}: {currentAcademicYear.year_name}
        </Label>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="national_id_search">{t('studentReEnrollment.nationalIdSearch')}</Label>
            <Input
              id="national_id_search"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder={t('studentReEnrollment.enterNationalId')}
              className="mt-1"
              maxLength={10}
              pattern="\d{10}"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSearch}
              disabled={searchStudentMutation.isPending || !nationalId.trim() || !/^\d{10}$/.test(nationalId.trim())}
              className="flex items-center gap-2"
            >
              {searchStudentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t('studentReEnrollment.search')}
            </Button>
          </div>
        </div>
      </div>

      {/* Student Found Section */}
      {foundStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('studentReEnrollment.studentFound')}
            </CardTitle>
            <CardDescription>
              {t('studentReEnrollment.reviewStudent')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('common.name')}</Label>
                <p className="text-sm font-medium">
                  {foundStudent.first_name} {foundStudent.last_name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('students.studentId')}</Label>
                <p className="text-sm font-medium">{foundStudent.student_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('studentReEnrollment.currentGrade')}</Label>
                <div className="flex items-center gap-2">
                  {foundStudent.grade_levels ? (
                    <Badge variant="outline">
                      {foundStudent.grade_levels.name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">{t('studentReEnrollment.noGradeAssigned')}</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('studentReEnrollment.parentPhone')}</Label>
                <p className="text-sm">{foundStudent.parent_phone || t('studentReEnrollment.notProvided')}</p>
              </div>
            </div>

            {/* Grade History */}
            {foundStudent.student_grade_history && foundStudent.student_grade_history.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('studentReEnrollment.gradeHistory')}
                </Label>
                <div className="mt-2 space-y-2">
                  {foundStudent.student_grade_history
                    .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
                    .map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span className="text-sm">
                            {history.grade_levels.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={history.is_active ? "default" : "secondary"}>
                            {history.academic_year}
                          </Badge>
                          {history.is_active && (
                            <Badge variant="default" className="text-xs">{t('studentReEnrollment.current')}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Re-enrollment Form */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium">{t('studentReEnrollment.reEnrollToNewGrade')}</h4>
              <div className="space-y-2">
                <Label htmlFor="new_grade">{t('studentReEnrollment.newGradeLevel')}</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('studentReEnrollment.selectNewGrade')} />
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
              <Button 
                onClick={handleReEnroll}
                disabled={updateStudentGradeMutation.isPending || !selectedGrade}
                className="w-full"
              >
                {updateStudentGradeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('studentReEnrollment.reEnrollStudent')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Student Found */}
      {searchStudentMutation.data === null && nationalId && !searchStudentMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('studentReEnrollment.noStudentFound')}{nationalId}</p>
              <p className="text-sm">{t('studentReEnrollment.checkId')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
