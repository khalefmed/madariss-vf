import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClasses } from '@/hooks/useClasses';
import { useAssignTeacherToClass, type Teacher } from '@/hooks/useTeachers';

interface TeacherClassAssignmentProps {
  teacher: Teacher;
  onClose: () => void;
}

export default function TeacherClassAssignment({ teacher, onClose }: TeacherClassAssignmentProps) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [hourlySalary, setHourlySalary] = useState('');
  const [currency, setCurrency] = useState('MRU');

  const { data: classes } = useClasses();
  const assignTeacherToClass = useAssignTeacherToClass();

  // Filter out classes already assigned to this teacher
  const assignedClassIds = teacher.teacher_classes?.map(tc => tc.classes.id) || [];
  const availableClasses = classes?.filter(c => !assignedClassIds.includes(c.id)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId || !hourlySalary) return;

    await assignTeacherToClass.mutateAsync({
      teacher_id: teacher.id,
      class_id: selectedClassId,
      hourly_salary: parseFloat(hourlySalary),
      currency
    });
    
    onClose();
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Assign Class to {teacher.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="class">Select Class *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.grade_levels?.name && `(${cls.grade_levels.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">Hourly Salary *</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                min="0"
                value={hourlySalary}
                onChange={(e) => setHourlySalary(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MRU">MRU</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={assignTeacherToClass.isPending || !selectedClassId || !hourlySalary}
            >
              Assign Class
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
