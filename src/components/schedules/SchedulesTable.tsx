import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchedulesByGrade } from '@/hooks/useSchedules';
import { useGrades } from '@/hooks/useGrades';
import { useUserRole } from '@/hooks/useUserRole';
import { useStudents } from '@/hooks/useStudents';
import { useLanguage } from '@/contexts/LanguageContext';
import EditableScheduleGrid from './EditableScheduleGrid';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TIME_SLOTS = ['8h-10h', '10h-12h', '12h-14h'];

export default function SchedulesTable() {
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const { data: userRole } = useUserRole();
  const { data: grades, isLoading: gradesLoading } = useGrades();
  const { data: students } = useStudents();
  const { t } = useLanguage();
  const { user } = useAuth();

    // Days of week full and short from translations
  const DAYS_OF_WEEK_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Map English days to translation keys:
  const dayTranslationKeys: Record<string, string> = {
    Monday: 'common.days.monday',
    Tuesday: 'common.days.tuesday',
    Wednesday: 'common.days.wednesday',
    Thursday: 'common.days.thursday',
    Friday: 'common.days.friday',
    Saturday: 'common.days.saturday',
  };

const daysOfWeekDisplay = DAYS_OF_WEEK_EN.map(day => t(dayTranslationKeys[day]));

  // For students, find their grade automatically using the auth user id
  const studentGradeId = userRole?.role === 'student' && user
    ? students?.find(student => student.user_id === user.id)?.grade_id
    : null;

  // Use student's grade if they are a student, otherwise use selected grade
  const effectiveGradeId = userRole?.role === 'student' ? studentGradeId || '' : selectedGradeId;

  const { data: schedules, isLoading: schedulesLoading } = useSchedulesByGrade(effectiveGradeId);
  const selectedGrade = grades?.find(g => g.id === effectiveGradeId);

  const isStudent = userRole?.role === 'student';
  const canEdit = ['admin', 'academic_director'].includes(userRole?.role || '');

  if (gradesLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-lg">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Student view - show their schedule directly
  if (isStudent) {
    if (!studentGradeId) {
      return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('schedules.noSchedule')}
            </h3>
            <p className="text-gray-600">
              {t('schedules.noScheduleDesc')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                  {t('schedules.mySchedule')}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t('schedules.weeklySchedule')} {selectedGrade?.name}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {schedulesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse">{t('common.loading')}</div>
              </div>
            ) : schedules && schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                    <div className="p-3 font-semibold text-sm text-center bg-gray-100 rounded">
                      {t('common.time')}
                    </div>
                    {daysOfWeekDisplay.map(day => (
                      <div key={day} className="p-3 font-semibold text-sm text-center bg-gray-100 rounded">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                  {TIME_SLOTS.map(timeSlot => (
                    <div key={timeSlot} className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                      <div className="p-3 font-medium text-sm bg-gray-50 rounded flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{timeSlot}</span>
                        <span className="sm:hidden">{timeSlot.split('-')[0]}</span>
                      </div>
                      {daysOfWeekDisplay.map((day, dayIndex) => {
                        const dayKey = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex]; // English keys for data matching
                        const scheduleItem = schedules.find(s => s.day_of_week === dayKey && s.time_slot === timeSlot);

                        return (
                          <div key={dayKey} className="p-3 bg-white border rounded min-h-[4rem] flex items-center justify-center">
                            {scheduleItem?.classes ? (
                              <div className="text-center">
                                <div className="font-medium text-sm text-blue-600 mb-1">
                                  {scheduleItem.classes.name}
                                </div>
                                {scheduleItem.classes.grade_levels && (
                                  <div className="text-xs text-gray-500">
                                    {scheduleItem.classes.grade_levels.name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('schedules.noSchedule')}
                </h3>
                <p className="text-gray-600">
                  {t('schedules.noScheduleDesc')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin/Teacher view - can select grades and edit
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                {t('schedules.title')}
              </CardTitle>
              <CardDescription className="mt-2">
                {canEdit ? t('schedules.manageByGrade') : t('schedules.viewSchedules')}
              </CardDescription>
            </div>

            <div className="w-full sm:w-64">
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('schedules.selectGrade')} />
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
          </div>
        </CardHeader>

        {selectedGradeId && (
          <CardContent className="p-4 sm:p-6">
            {canEdit ? (
              <EditableScheduleGrid
                selectedGradeId={selectedGradeId}
                schedules={schedules || []}
              />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('schedules.scheduleGrid')}</h3>
                {schedulesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse">{t('common.loading')}</div>
                  </div>
                ) : schedules && schedules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                        <div className="p-3 font-semibold text-sm text-center bg-gray-100 rounded">
                          {t('common.time')}
                        </div>
                        {daysOfWeekDisplay.map(day => (
                          <div key={day} className="p-3 font-semibold text-sm text-center bg-gray-100 rounded">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>

                      {TIME_SLOTS.map(timeSlot => (
                        <div key={timeSlot} className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                          <div className="p-3 font-medium text-sm bg-gray-50 rounded flex items-center justify-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {timeSlot}
                          </div>
                          {daysOfWeekDisplay.map((day, dayIndex) => {
                            const dayKey = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
                            const scheduleItem = schedules.find(s =>
                              s.day_of_week === dayKey && s.time_slot === timeSlot
                            );

                            return (
                              <div key={dayKey} className="p-3 bg-white border rounded min-h-[4rem] flex items-center justify-center">
                                {scheduleItem?.classes ? (
                                  <div className="text-center">
                                    <div className="font-medium text-sm text-blue-600">
                                      {scheduleItem.classes.name}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">-</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('schedules.noSchedule')}
                    </h3>
                    <p className="text-gray-600">
                      {t('schedules.noScheduleDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}