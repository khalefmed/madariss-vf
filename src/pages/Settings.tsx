import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import PersonalSettings from '@/components/settings/PersonalSettings';
import SchoolSettings from '@/components/settings/SchoolSettings';
import { Loader2 } from 'lucide-react';

export default function Settings() {
  const { data: userRole, isLoading } = useUserRole();
  const { t } = useLanguage();

  const isSystemManager = userRole?.role === 'super_admin';
  const isSchoolAdmin = userRole?.role === 'admin';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12 p-4 sm:p-6 lg:p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const subtitle = isSystemManager
    ? t('settings.subtitle.superAdmin')
    : isSchoolAdmin
    ? t('settings.subtitle.admin')
    : t('settings.subtitle.user');

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('settings.title')}
          </h2>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Personal Settings - Available to all users */}
          <PersonalSettings />

          {/* School Settings - Only for school admins (not super admins) */}
          {isSchoolAdmin && <SchoolSettings />}
        </div>
      </div>
    </DashboardLayout>
  );
}