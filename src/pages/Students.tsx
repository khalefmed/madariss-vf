import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStudents, useUpdateStudentGrade, type Student } from '@/hooks/useStudents';
import { useGrades } from '@/hooks/useGrades';
import { Plus, Users, Loader2 } from 'lucide-react';
import StudentDetails from '@/components/students/StudentDetails';
import StudentFilters from '@/components/students/StudentFilters';
import StudentExportActions from '@/components/students/StudentExportActions';
import StudentRegistrationTabs from '@/components/students/StudentRegistrationTabs';
import StudentsTable from '@/components/students/StudentsTable';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const { data: grades } = useGrades();
  const updateStudentGradeMutation = useUpdateStudentGrade();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { t } = useLanguage();

  const handleUpdateStudentGrade = async (studentId: string, gradeId: string) => {
    try {
      await updateStudentGradeMutation.mutateAsync({ studentId, gradeId });
    } catch (error) {
      console.error('Error updating student grade:', error);
    }
  };

  const filteredStudents = students?.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.national_id && student.national_id.includes(searchTerm));

    const matchesGrade = selectedGrade === 'all' || student.grade_id === selectedGrade;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && student.is_active) ||
      (statusFilter === 'inactive' && !student.is_active);

    return matchesSearch && matchesGrade && matchesStatus;
  }) || [];

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleStudentAdded = (student: Student) => {
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('students.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('students.description')}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t('students.addStudent')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('students.studentRegistration')}</DialogTitle>
                <DialogDescription>
                  {t('students.registrationDesc')}
                </DialogDescription>
              </DialogHeader>
              <StudentRegistrationTabs
                grades={grades}
                onStudentAdded={handleStudentAdded}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <StudentFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            grades={grades}
          />

          <StudentExportActions
            filteredStudents={filteredStudents}
            grades={grades}
            selectedGrade={selectedGrade}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              {t('students.studentRecords')}
            </CardTitle>
            <CardDescription>
              {t('students.totalStudents')}: {students?.length || 0} | {t('students.filtered')}: {filteredStudents.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <StudentsTable
                students={filteredStudents}
                grades={grades}
                onViewDetails={handleViewDetails}
                onUpdateGrade={handleUpdateStudentGrade}
                onAddStudent={() => setIsDialogOpen(true)}
                searchTerm={searchTerm}
                selectedGrade={selectedGrade}
                statusFilter={statusFilter}
              />
            )}
          </CardContent>
        </Card>

        <StudentDetails
          student={selectedStudent}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedStudent(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}