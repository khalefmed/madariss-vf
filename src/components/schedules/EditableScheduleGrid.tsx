import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateSchedule, useInitializeScheduleSlots } from '@/hooks/useSchedules';
import { useClasses } from '@/hooks/useClasses';
import { Pencil, Save, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['8h-10h', '10h-12h', '12h-14h'];

interface EditableScheduleGridProps {
  selectedGradeId: string;
  schedules: any[];
}

export default function EditableScheduleGrid({ selectedGradeId, schedules }: EditableScheduleGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('none');
  const updateScheduleMutation = useUpdateSchedule();
  const initializeSlotsMutation = useInitializeScheduleSlots();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { t } = useLanguage();

  // Filter classes by the selected grade
  const gradeClasses = classes?.filter(c => c.grade_id === selectedGradeId) || [];

  // Check if we have all expected schedule slots
  const expectedSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length; // 18 slots total
  const actualSlots = schedules?.length || 0;
  const missingSlots = actualSlots < expectedSlots;

  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return schedules.find(s => s.day_of_week === day && s.time_slot === timeSlot);
  };

  const handleEditClick = (day: string, timeSlot: string) => {
    const cellKey = `${day}-${timeSlot}`;
    const schedule = getScheduleForSlot(day, timeSlot);
    
    if (!schedule) {
      toast.error(t('scheduleGrid.error.slotNotFoundInitialize'));
      return;
    }
    
    setSelectedClassId(schedule?.class_id || 'none');
    setEditingCell(cellKey);
  };

  const handleSave = async (day: string, timeSlot: string) => {
    const schedule = getScheduleForSlot(day, timeSlot);
    if (!schedule) {
      toast.error(t('scheduleGrid.error.slotNotFound'));
      return;
    }

    try {
      await updateScheduleMutation.mutateAsync({
        id: schedule.id,
        class_id: selectedClassId === 'none' ? null : selectedClassId
      });
      
      setEditingCell(null);
      setSelectedClassId('none');
      toast.success(t('scheduleGrid.success.updated'));
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error(t('scheduleGrid.error.updateFailed'));
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setSelectedClassId('none');
  };

  const handleInitializeSlots = async () => {
    try {
      await initializeSlotsMutation.mutateAsync(selectedGradeId);
    } catch (error) {
      console.error('Error initializing schedule slots:', error);
    }
  };

  if (classesLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('scheduleGrid.title')}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse">{t('common.loadingClasses')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold">{t('scheduleGrid.title')}</h3>
        {missingSlots && (
          <Button
            onClick={handleInitializeSlots}
            disabled={initializeSlotsMutation.isPending}
            variant="outline"
            className="flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${initializeSlotsMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('scheduleGrid.button.initializeSlots')}</span>
            <span className="sm:hidden">{t('scheduleGrid.button.init')}</span>
          </Button>
        )}
      </div>
      
      {missingSlots && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            {t('scheduleGrid.warning.missingSlots')}
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 sm:w-24">{t('common.time')}</TableHead>
              {DAYS_OF_WEEK.map(day => (
                <TableHead key={day} className="text-center min-w-24 sm:min-w-32">
                  <span className="hidden sm:inline">{t(`common.days.${day.toLowerCase()}`)}</span>
                  <span className="sm:hidden">{t(`common.daysShort.${day.toLowerCase()}`)}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {TIME_SLOTS.map(timeSlot => (
              <TableRow key={timeSlot}>
                <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                  {timeSlot}
                </TableCell>
                {DAYS_OF_WEEK.map(day => {
                  const scheduleItem = getScheduleForSlot(day, timeSlot);
                  const cellKey = `${day}-${timeSlot}`;
                  const isEditing = editingCell === cellKey;

                  return (
                    <TableCell key={cellKey} className="relative group p-1 sm:p-2">
                      {!scheduleItem ? (
                        <div className="text-gray-400 text-xs">
                          {t('scheduleGrid.slotNotInitialized')}
                        </div>
                      ) : isEditing ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger className="w-full sm:w-40">
                              <SelectValue placeholder={t('scheduleGrid.selectClass')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('scheduleGrid.noClass')}</SelectItem>
                              {gradeClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSave(day, timeSlot)}
                              disabled={updateScheduleMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {scheduleItem?.classes ? (
                            <Badge variant="outline" className="text-xs px-1 py-0.5 sm:px-2 sm:py-1">
                              <span className="truncate max-w-16 sm:max-w-full">
                                {scheduleItem.classes.name}
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">-</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 sm:h-8 sm:w-8"
                            onClick={() => handleEditClick(day, timeSlot)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}