
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TeachersTable from '@/components/teachers/TeachersTable';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Teachers() {
  const { t } = useLanguage();
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('teachers.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('teachers.description')}
            </p>
          </div>
        </div> */}
        <TeachersTable />
      </div>
    </DashboardLayout>
  );
}
