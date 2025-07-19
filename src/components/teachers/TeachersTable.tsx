import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, Eye, Edit, UserPlus, X } from 'lucide-react';
import { useTeachers, useSearchTeachers, useUnassignTeacherFromClass, type Teacher } from '@/hooks/useTeachers';
import { useLanguage } from '@/contexts/LanguageContext';
import TeacherForm from './TeacherForm';
import TeacherClassAssignment from './TeacherClassAssignment';

export default function TeachersTable() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherClassId, setSelectedTeacherClassId] = useState<string>('');

  const { data: allTeachers, isLoading } = useTeachers();
  const { data: searchResults } = useSearchTeachers(searchTerm);
  const unassignMutation = useUnassignTeacherFromClass();

  const teachers = searchTerm.trim() ? searchResults : allTeachers;

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditDialog(true);
  };

  const handleAssignClass = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignDialog(true);
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsDialog(true);
  };

  const handleUnassignClick = (teacherClassId: string, teacher: Teacher) => {
    setSelectedTeacherClassId(teacherClassId);
    setSelectedTeacher(teacher);
    setShowUnassignDialog(true);
  };

  const handleUnassignConfirm = async () => {
    if (selectedTeacherClassId) {
      await unassignMutation.mutateAsync(selectedTeacherClassId);
      setShowUnassignDialog(false);
      setSelectedTeacherClassId('');
      setSelectedTeacher(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">{t('teachers.loadingTeachers')}</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('teachers.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('teachers.description')}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t('teachers.addTeacher')}</span>
          <span className="sm:hidden">{t('common.add')}</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          {/* <CardTitle className="text-lg sm:text-xl">{t('teachers.searchTitle')}</CardTitle> */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('teachers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">{t('teachers.name')}</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">{t('teachers.phone')}</TableHead>
                  <TableHead className="min-w-[140px] hidden md:table-cell">{t('teachers.nationalNumber')}</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">{t('teachers.nationality')}</TableHead>
                  <TableHead className="min-w-[150px]">{t('teachers.classes')}</TableHead>
                  <TableHead className="min-w-[140px]">{t('teachers.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium text-sm">{teacher.name}</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{teacher.phone || '-'}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{teacher.national_number}</TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">{teacher.nationality || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.teacher_classes?.filter(tc => tc.is_active).map((tc) => (
                          <div key={tc.id} className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              <span className="hidden sm:inline">{tc.classes.name}</span>
                              <span className="sm:hidden">{tc.classes.name.slice(0, 6)}...</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleUnassignClick(tc.id, teacher)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {(!teacher.teacher_classes || teacher.teacher_classes.length === 0) && (
                          <span className="text-muted-foreground text-xs">{t('teachers.noClasses')}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(teacher)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">{t('common.view')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">{t('common.edit')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignClass(teacher)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="hidden sm:inline sm:ml-2">{t('teachers.assign')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!teachers || teachers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      {searchTerm ? t('teachers.noSearchResults') : t('teachers.noTeachers')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Teacher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <TeacherForm onClose={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          {selectedTeacher && (
            <TeacherForm teacher={selectedTeacher} onClose={() => setShowEditDialog(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Class Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          {selectedTeacher && (
            <TeacherClassAssignment teacher={selectedTeacher} onClose={() => setShowAssignDialog(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('teachers.unassignTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('teachers.unassignConfirm') +  { name: selectedTeacher?.name }}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignConfirm} disabled={unassignMutation.isPending}>
              {unassignMutation.isPending ? t('teachers.unassigning') : t('teachers.unassign')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Teacher Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('teachers.details')}</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">{t('teachers.name')}:</Label>
                  <p>{selectedTeacher.name}</p>
                </div>
                <div>
                  <Label className="font-medium">{t('teachers.phone')}:</Label>
                  <p>{selectedTeacher.phone || t('teachers.notProvided')}</p>
                </div>
                <div>
                  <Label className="font-medium">{t('teachers.nationalNumber')}:</Label>
                  <p>{selectedTeacher.national_number}</p>
                </div>
                <div>
                  <Label className="font-medium">{t('teachers.nationality')}:</Label>
                  <p>{selectedTeacher.nationality || t('teachers.notProvided')}</p>
                </div>
                <div className="col-span-2">
                  <Label className="font-medium">{t('teachers.email')}:</Label>
                  <p>{selectedTeacher.email || t('teachers.notProvided')}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">{t('teachers.assignedClasses')}:</Label>
                <div className="mt-2 space-y-2">
                  {selectedTeacher.teacher_classes?.filter(tc => tc.is_active).map((tc) => (
                    <div key={tc.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{tc.classes.name}</p>
                        {tc.classes.grade_levels?.name && (
                          <p className="text-sm text-muted-foreground">{tc.classes.grade_levels.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-medium">{tc.hourly_salary} {tc.currency}/hour</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleUnassignClick(tc.id, selectedTeacher)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!selectedTeacher.teacher_classes || selectedTeacher.teacher_classes.length === 0) && (
                    <p className="text-muted-foreground">{t('teachers.noAssignedClasses')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}