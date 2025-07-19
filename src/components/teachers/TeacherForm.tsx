import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateTeacher, useUpdateTeacher, type Teacher } from '@/hooks/useTeachers';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeacherFormProps {
  teacher?: Teacher;
  onClose: () => void;
}

export default function TeacherForm({ teacher, onClose }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    phone: teacher?.phone || '',
    national_number: teacher?.national_number || '',
    nationality: teacher?.nationality || '',
    email: teacher?.email || '',
  });

  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teacher) {
      await updateTeacher.mutateAsync({
        id: teacher.id,
        ...formData
      });
    } else {
      await createTeacher.mutateAsync(formData);
    }
    
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{teacher ? t('teachers.editTeacher') : t('teachers.addNewTeacher')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('teacherForm.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">{t('teacherForm.phoneNumber')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="national_number">{t('teacherForm.nationalNumber')} *</Label>
              <Input
                id="national_number"
                value={formData.national_number}
                onChange={(e) => handleChange('national_number', e.target.value)}
                pattern="[0-9]{10}"
                title="National number must be exactly 10 digits"
                maxLength={10}
                required
                disabled={!!teacher} // Can't change national number after creation
              />
              <p className="text-sm text-muted-foreground mt-1">
                {t('teacherForm.mustBe10Digits')}
              </p>
            </div>
            
            <div>
              <Label htmlFor="nationality">{t('teacherForm.nationality')}</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="email">{t('teacherForm.emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('teacherForm.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={createTeacher.isPending || updateTeacher.isPending}
            >
              {teacher ? t('teacherForm.updateTeacher') : t('teacherForm.createTeacher')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
