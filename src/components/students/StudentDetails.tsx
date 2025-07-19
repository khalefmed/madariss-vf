
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGrades, type GradeLevel } from '@/hooks/useGrades';
import { type Student } from '@/hooks/useStudents';
import StudentBalanceCard from './StudentBalanceCard';

interface StudentDetailsProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDetails({ student, isOpen, onClose }: StudentDetailsProps) {
  const { data: grades } = useGrades();

  if (!student) return null;

  const studentGrade = grades?.find(g => g.id === student.grade_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View detailed information about the selected student.
          </DialogDescription>
        </DialogHeader>
      
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Balance Card */}
          <StudentBalanceCard 
            balance={student.balance}
            discount_percentage={student.discount_percentage}
            grade={studentGrade || null}
          />

          {/* Personal Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">First Name:</p>
                <p className="text-gray-600">{student.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Name:</p>
                <p className="text-gray-600">{student.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Student ID:</p>
                <p className="text-gray-600">{student.student_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">National ID:</p>
                <p className="text-gray-600">{student.national_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email:</p>
                <p className="text-gray-600">{student.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone:</p>
                <p className="text-gray-600">{student.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date of Birth:</p>
                <p className="text-gray-600">{student.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Address:</p>
                <p className="text-gray-600">{student.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sex:</p>
                <p className="text-gray-600">{student.sex || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Grade:</p>
                <p className="text-gray-600">{studentGrade?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Group Name:</p>
                <p className="text-gray-600">{student.group_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Enrollment Date:</p>
                <p className="text-gray-600">{student.enrollment_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Is Active:</p>
                <p className="text-gray-600">{student.is_active ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Parent Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Parent Name:</p>
                <p className="text-gray-600">{student.parent_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Parent Email:</p>
                <p className="text-gray-600">{student.parent_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Parent Phone:</p>
                <p className="text-gray-600">{student.parent_phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
