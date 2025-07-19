
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users } from 'lucide-react';
import NewStudentRegistration from './NewStudentRegistration';
import ExistingStudentReEnrollment from './ExistingStudentReEnrollment';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Student } from '@/hooks/useStudents';
import type { Tables } from '@/integrations/supabase/types';

type Grade = Tables<'grade_levels'>;

interface StudentRegistrationTabsProps {
  grades?: Grade[];
  onStudentAdded?: (student: Student) => void;
  onClose?: () => void;
}

export default function StudentRegistrationTabs({ 
  grades, 
  onStudentAdded, 
  onClose 
}: StudentRegistrationTabsProps) {
  const [activeTab, setActiveTab] = useState('new');
  const { t } = useLanguage();

  const handleStudentAdded = (student: Student) => {
    onStudentAdded?.(student);
    onClose?.();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {t('studentRegistration.newStudent')}
        </TabsTrigger>
        <TabsTrigger value="existing" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('studentRegistration.reEnrollStudent')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('studentRegistration.registerNewStudent')}</CardTitle>
            <CardDescription>
              {t('studentRegistration.enterStudentInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewStudentRegistration 
              grades={grades} 
              onStudentAdded={handleStudentAdded}
              onClose={onClose || (() => {})}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="existing" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('studentRegistration.reEnrollExistingStudent')}</CardTitle>
            <CardDescription>
              {t('studentRegistration.searchStudentById')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExistingStudentReEnrollment 
              grades={grades} 
              onStudentAdded={handleStudentAdded}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
