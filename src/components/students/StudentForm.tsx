import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type Grade = Tables<'grade_levels'>;

interface StudentFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  grades?: Grade[];
  isLoading: boolean;
}

export default function StudentForm({ onSubmit, grades, isLoading }: StudentFormProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('1');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Add the selected grade and group to form data
    const formData = new FormData(e.currentTarget);
    if (selectedGrade) formData.set('grade_id', selectedGrade);
    formData.set('group_name', groupName);
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade_id">{t('studentForm.gradeLevel')}</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder={t('studentForm.selectGradeLevel')} />
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
        <div className="space-y-2">
          <Label htmlFor="group_name">{t('studentForm.group')}</Label>
          <Input
            id="group_name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">{t('studentForm.firstName')}</Label>
          <Input
            id="first_name"
            name="first_name"
            placeholder="Moahmed"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">{t('studentForm.lastName')}</Label>
          <Input
            id="last_name"
            name="last_name"
            placeholder="Khalef"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="national_id">{t('studentForm.nationalId')}</Label>
          <Input
            id="national_id"
            name="national_id"
            placeholder="1234567890123"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('studentForm.sex')}</Label>
          <RadioGroup name="sex" className="flex flex-row space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">{t('studentForm.male')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">{t('studentForm.female')}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('studentForm.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="med@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t('studentForm.phone')}</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="34567645"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">{t('studentForm.dateOfBirth')}</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">{t('studentForm.address')}</Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Main St, City, State"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">{t('studentForm.parentGuardianInfo')}</h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parent_name">{t('studentForm.parentGuardianName')}</Label>
            <Input
              id="parent_name"
              name="parent_name"
              placeholder="Med Khalef"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parent_email">{t('studentForm.parentEmail')}</Label>
            <Input
              id="parent_email"
              name="parent_email"
              type="email"
              placeholder="med@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_phone">{t('studentForm.parentPhone')}</Label>
            <Input
              id="parent_phone"
              name="parent_phone"
              placeholder="34543456"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {t('studentForm.addStudent')}
      </Button>
    </form>
  );
}
