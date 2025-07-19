
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Users, Plus } from 'lucide-react';
import type { Student } from '@/hooks/useStudents';
import type { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Grade = Tables<'grade_levels'>;

interface StudentsTableProps {
  students: Student[];
  grades?: Grade[];
  onViewDetails: (student: Student) => void;
  onUpdateGrade: (studentId: string, gradeId: string) => void;
  onAddStudent: () => void;
  searchTerm: string;
  selectedGrade: string;
  statusFilter: string;
}

export default function StudentsTable({
  students,
  grades,
  onViewDetails,
  onUpdateGrade,
  onAddStudent,
  searchTerm,
  selectedGrade,
  statusFilter
}: StudentsTableProps) {
  const { t } = useLanguage();

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('students.noStudentsFound')}</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm || selectedGrade !== 'all' || statusFilter !== 'all' ? t('students.noStudentsMatch') : t('students.startByAdding')}
        </p>
        {!searchTerm && selectedGrade === 'all' && statusFilter === 'all' && (
          <Button onClick={onAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            {t('students.addFirstStudent')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap min-w-[100px]">{t('students.studentId')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[150px]">{t('students.name')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[120px] hidden sm:table-cell">{t('students.nationalId')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[120px]">{t('students.grade')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[130px] hidden md:table-cell">{t('students.parentPhone')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[100px]">{t('students.status')}</TableHead>
            <TableHead className="whitespace-nowrap min-w-[180px]">{t('students.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const studentGrade = student.grade_levels;
            
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-sm">{student.student_id}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{student.first_name} {student.last_name}</TableCell>
                <TableCell className="text-sm text-gray-600 hidden sm:table-cell">{student.national_id || t('students.notProvided')}</TableCell>
                <TableCell>
                  {studentGrade ? (
                    <Badge variant="outline" className="text-xs">{studentGrade.name}</Badge>
                  ) : (
                    <span className="text-gray-400 text-xs">{t('students.noGradeAssigned')}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600 hidden md:table-cell">{student.parent_phone || t('students.notProvided')}</TableCell>
                <TableCell>
                  <Badge variant={student.is_active ? "default" : "secondary"} className="text-xs">
                    {student.is_active ? t('students.active') : t('students.inactive')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(student)}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline sm:ml-2">Voir</span>
                    </Button>
                    <Select 
                      value={student.grade_id || ""} 
                      onValueChange={(value) => onUpdateGrade(student.id, value)}
                    >
                      <SelectTrigger className="w-20 sm:w-32 h-8 text-xs">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades?.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id} className="text-xs">
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
