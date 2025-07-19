
import React, { Suspense, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useTeacherClasses } from '@/hooks/useTeachers';
import { useActiveQuarter } from '@/hooks/useAcademicQuarters';
import { BookOpen, Users, Calculator, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import StudentMarksView from '@/components/marks/StudentMarksView';

// Lazy load components to prevent white page issues
const TeacherMarksEntry = React.lazy(() => import('@/components/marks/TeacherMarksEntry'));
const AdminMarksReporting = React.lazy(() => import('@/components/marks/AdminMarksReporting'));

export default function Marks() {
  const { data: userRole, isLoading: userRoleLoading, error: userRoleError } = useUserRole();
  const { data: teacherClasses, isLoading: teacherClassesLoading, error: teacherClassesError } = useTeacherClasses();
  const { data: activeQuarter, isLoading: quarterLoading, error: quarterError } = useActiveQuarter();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [viewMode, setViewMode] = useState<'entry' | 'reports'>('entry');
  const { t } = useLanguage();

  const isTeacher = userRole?.role === 'teacher';
  const isAdmin = userRole?.role === 'admin';
  const isAcademicDirector = userRole?.role === 'academic_director';
  const isStudent = userRole?.role === 'student';

  console.log('Marks page - User role:', userRole?.role);
  console.log('Marks page - Teacher classes:', teacherClasses);
  console.log('Marks page - Teacher classes loading:', teacherClassesLoading);
  console.log('Marks page - Teacher classes error:', teacherClassesError);
  console.log('Marks page - Active quarter:', activeQuarter);

  // Error handling
  if (userRoleError || quarterError) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading page data. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state while we're determining the user role
  if (userRoleLoading || quarterLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-pulse">{t('common.loading')}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If user role is not loaded or not authorized, show access restricted
  if (!userRole || (!isTeacher && !isAdmin && !isAcademicDirector && !isStudent)) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('absences.accessRestricted')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('absences.onlyAccessible')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('marks.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {isTeacher ? t('marks.enterMarks') : isStudent ? t('marks.viewYourMarks') : t('marks.viewReports')}
            </p>
          </div>

          {(isAdmin || isAcademicDirector) && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'entry' ? 'default' : 'outline'}
                onClick={() => setViewMode('entry')}
                size="sm"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t('marks.marksEntry')}
              </Button>
              <Button
                variant={viewMode === 'reports' ? 'default' : 'outline'}
                onClick={() => setViewMode('reports')}
                size="sm"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {t('marks.reports')}
              </Button>
            </div>
          )}
        </div>

        {/* Active Quarter Info - only show for teachers and admins */}
        {activeQuarter && (isTeacher || isAdmin || isAcademicDirector) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                {t('marks.currentQuarter')}: {activeQuarter.name}
              </CardTitle>
              <CardDescription>
                {t('marks.quarter')} {activeQuarter.quarter} • {new Date(activeQuarter.start_date).toLocaleDateString()} - {new Date(activeQuarter.end_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Error handling for teacher classes */}
        {isTeacher && teacherClassesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading your assigned classes: {teacherClassesError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state for teacher classes */}
        {isTeacher && teacherClassesLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-pulse">{t('common.loading')}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teacher View - Class Selection */}
        {isTeacher && !teacherClassesLoading && teacherClasses && teacherClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                {t('marks.selectClass')}
              </CardTitle>
              <CardDescription>
                {t('marks.chooseClass')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder={t('marks.selectClassToEnter')} />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map((tc) => (
                    <SelectItem key={tc.class_id} value={tc.class_id}>
                      {tc.classes.name} - {tc.classes.grade_levels?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Student View - Show their marks */}
        {isStudent && (
          <Suspense fallback={
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-pulse">{t('common.loading')}</div>
                </div>
              </CardContent>
            </Card>
          }>
            <StudentMarksView />
          </Suspense>
        )}

        {/* Marks Entry Component */}
        {((isTeacher && selectedClass) || ((isAdmin || isAcademicDirector) && viewMode === 'entry')) && (
          <Suspense fallback={
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-pulse">{t('common.loading')}</div>
                </div>
              </CardContent>
            </Card>
          }>
            <TeacherMarksEntry 
              classId={selectedClass}
              selectedQuarter={activeQuarter}
              isAdminView={isAdmin || isAcademicDirector}
            />
          </Suspense>
        )}

        {/* Admin Reports View */}
        {(isAdmin || isAcademicDirector) && viewMode === 'reports' && (
          <Suspense fallback={
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-pulse">{t('common.loading')}</div>
                </div>
              </CardContent>
            </Card>
          }>
            <AdminMarksReporting />
          </Suspense>
        )}

        {/* No Classes Message for Teachers */}
        {isTeacher && !teacherClassesLoading && (!teacherClasses || teacherClasses.length === 0) && !teacherClassesError && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('marks.noClassesAssigned')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('marks.notAssignedYet')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
