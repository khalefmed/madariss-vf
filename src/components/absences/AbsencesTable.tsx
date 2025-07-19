import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Search, Users } from 'lucide-react';
import { useGrades } from '@/hooks/useGrades';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAbsences, useCreateAbsences, useStudentClassAbsences } from '@/hooks/useAbsences';
import { useStudentByNationalId } from '@/hooks/useStudents';
import GradeLevelSelect from './GradeLevelSelect';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AbsencesTable() {
  const { t } = useLanguage();

  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [markingStep, setMarkingStep] = useState<'grade' | 'classes' | 'students'>('grade');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<any>(null);

  const { data: grades } = useGrades();
  const { data: classes } = useClasses();
  const { data: students } = useStudents();
  const { data: absences } = useAbsences();
  const { data: studentClassAbsences } = useStudentClassAbsences(searchedStudent?.id);
  const createAbsences = useCreateAbsences();
  const studentByNationalId = useStudentByNationalId();

  const gradeClasses = classes?.filter(cls => cls.grade_id === selectedGrade && cls.is_active) || [];
  const gradeStudents = students?.filter(student => student.grade_id === selectedGrade && student.is_active) || [];

  const handleSearchStudent = async () => {
    if (!studentSearchTerm.trim()) return;

    try {
      const result = await studentByNationalId.mutateAsync(studentSearchTerm);
      setSearchedStudent(result);
    } catch (error) {
      console.error('Error searching student:', error);
      setSearchedStudent(null);
    }
  };

  const handleSubmitAbsences = async () => {
    if (selectedStudents.length === 0 || selectedClasses.length === 0) return;

    try {
      await createAbsences.mutateAsync({
        studentIds: selectedStudents,
        classIds: selectedClasses,
        date: selectedDate
      });

      setSelectedGrade('');
      setSelectedClasses([]);
      setSelectedStudents([]);
      setMarkingStep('grade');
    } catch (error) {
      console.error('Error creating absences:', error);
    }
  };

  const studentAbsences = searchedStudent ? absences?.filter(absence => absence.student_id === searchedStudent.id) || [] : [];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t('absences.title')}</h1>
      </div>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mark" className="text-xs sm:text-sm">
            {t('absences.tabs.mark')}
          </TabsTrigger>
          <TabsTrigger value="lookup" className="text-xs sm:text-sm">
            {t('absences.tabs.lookup')}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            {t('absences.tabs.history')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                {t('absences.mark.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="date">{t('absences.mark.date')}</Label>
                <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>

              {markingStep === 'grade' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">{t('absences.mark.select_grade_label')}</Label>
                    <GradeLevelSelect
                      value={selectedGrade}
                      onValueChange={setSelectedGrade}
                      placeholder={t('absences.mark.select_grade_placeholder')}
                    />
                  </div>
                  {selectedGrade && (
                    <Button onClick={() => setMarkingStep('classes')} className="w-full sm:w-auto">
                      {t('absences.mark.next_classes')}
                    </Button>
                  )}
                </div>
              )}

              {markingStep === 'classes' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-semibold">{t('absences.mark.select_classes')}</h3>
                    <Button variant="outline" onClick={() => setMarkingStep('grade')} className="w-full sm:w-auto">
                      {t('absences.mark.back')}
                    </Button>
                  </div>

                  {gradeClasses.length > 0 ? (
                    <div className="space-y-2">
                      {gradeClasses.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            id={cls.id}
                            checked={selectedClasses.includes(cls.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClasses([...selectedClasses, cls.id]);
                              } else {
                                setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                              }
                            }}
                          />
                          <label htmlFor={cls.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cls.name}</span>
                              <Badge variant="outline">{cls.grade_levels?.name || t('absences.mark.grade')}</Badge>
                            </div>
                          </label>
                        </div>
                      ))}
                      {selectedClasses.length > 0 && (
                        <Button onClick={() => setMarkingStep('students')} className="w-full sm:w-auto">
                          {t('absences.mark.next_students')}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t('absences.unknownClass')}</p>
                  )}
                </div>
              )}

              {markingStep === 'students' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-lg font-semibold">{t('absences.mark.mark_students')}</h3>
                    <Button variant="outline" onClick={() => setMarkingStep('classes')} className="w-full sm:w-auto">
                      {t('absences.mark.back')}
                    </Button>
                  </div>

                  <div className="responsive-grid">
                    {gradeStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <label htmlFor={student.id} className="flex-1 cursor-pointer">
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="responsive-button-group">
                    <Button
                      onClick={handleSubmitAbsences}
                      disabled={selectedStudents.length === 0 || createAbsences.isPending}
                      className="mobile-full-width"
                    >
                      {createAbsences.isPending ? t('absences.saving') : t('absences.mark.save_button')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

       <TabsContent value="lookup" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
        <Search className="h-5 w-5" />
        {t('absences.lookup.title')}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Label htmlFor="search">{t('absences.lookup.input_label')}</Label>
          <Input
            id="search"
            placeholder={t('absences.lookup.input_placeholder')}
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSearchStudent}
          disabled={!studentSearchTerm.trim() || studentByNationalId.isPending}
          className="mt-0 sm:mt-6 w-full sm:w-auto"
        >
          {studentByNationalId.isPending ? t('absences.lookup.searching') : t('absences.lookup.search_button')}
        </Button>
      </div>

      {searchedStudent && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">{searchedStudent.first_name} {searchedStudent.last_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('absences.lookup.student_label')}: {searchedStudent.student_id} | {t('absences.lookup.national_id_label')}: {searchedStudent.national_id}
                  </p>
                  {searchedStudent.grade_levels && (
                    <Badge variant="outline">{searchedStudent.grade_levels.name}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {studentClassAbsences && studentClassAbsences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('absences.lookup.summary_by_class')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="responsive-grid">
                  {studentClassAbsences.map((classAbsence: any) => (
                    <div key={classAbsence.class_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium text-sm sm:text-base">{classAbsence.class_name}</span>
                      <Badge variant="destructive" className="text-xs sm:text-sm">
                        {classAbsence.absence_count} absence{classAbsence.absence_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t('absences.lookup.detailed_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              {studentAbsences.length > 0 ? (
                <div className="responsive-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('absences.mark.date')}</TableHead>
                        <TableHead className="mobile-hide">{t('absences.lookup.class')}</TableHead>
                        <TableHead className="mobile-hide">{t('absences.lookup.status')}</TableHead>
                        <TableHead className="mobile-hide">{t('absences.lookup.notes')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAbsences.map((absence) => (
                        <TableRow key={absence.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{new Date(absence.date).toLocaleDateString()}</div>
                              <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                <div>{t('absences.lookup.class')}: {absence.classes?.name || t('absences.unknown.class')}</div>
                                <div className="mt-1">
                                  <Badge variant="destructive" className="text-xs">{absence.status}</Badge>
                                </div>
                                {absence.notes && <div className="mt-1">{t('absences.lookup.notes')}: {absence.notes}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="mobile-hide">{absence.classes?.name || t('absences.unknown.class')}</TableCell>
                          <TableCell className="mobile-hide">
                            <Badge variant="destructive">{absence.status}</Badge>
                          </TableCell>
                          <TableCell className="mobile-hide">{absence.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">{t('absences.lookup.no_absences')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {studentByNationalId.isError && !searchedStudent && (
        <p className="text-destructive text-sm sm:text-base">{t('absences.lookup.not_found')}</p>
      )}
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="history" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">{t('absences.history.title')}</CardTitle>
    </CardHeader>
    <CardContent>
      {absences && absences.length > 0 ? (
        <div className="responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('absences.mark.date')}</TableHead>
                <TableHead className="mobile-hide">{t('absences.history.student')}</TableHead>
                <TableHead className="mobile-hide">{t('absences.history.class')}</TableHead>
                <TableHead className="mobile-hide">{t('absences.history.status')}</TableHead>
                <TableHead className="mobile-hide">{t('absences.history.notes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(absence.date).toLocaleDateString()}</div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">
                        <div>
                          {absence.students ?
                            `${absence.students.first_name} ${absence.students.last_name} (${absence.students.student_id})`
                            : t('absences.unknown.student')}
                        </div>
                        <div>{t('absences.history.class')}: {absence.classes?.name || t('absences.unknown.class')}</div>
                        <div className="mt-1">
                          <Badge variant="destructive" className="text-xs">{absence.status}</Badge>
                        </div>
                        {absence.notes && <div className="mt-1">{t('absences.history.notes')}: {absence.notes}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="mobile-hide">
                    {absence.students ?
                      `${absence.students.first_name} ${absence.students.last_name} (${absence.students.student_id})`
                      : t('absences.unknown.student')}
                  </TableCell>
                  <TableCell className="mobile-hide">{absence.classes?.name || t('absences.unknown.class')}</TableCell>
                  <TableCell className="mobile-hide">
                    <Badge variant="destructive">{absence.status}</Badge>
                  </TableCell>
                  <TableCell className="mobile-hide">{absence.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground">{t('absences.history.no_absences')}</p>
      )}
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>
    </div>
  );
}