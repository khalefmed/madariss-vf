import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useSchools } from '@/hooks/useSchools';
import SchoolSubscriptionManagement from '@/components/schools/SchoolSubscriptionManagement';
import SchoolManagersManagement from '@/components/schools/SchoolManagersManagement';
import SchoolAdminManagement from '@/components/schools/SchoolAdminManagement';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SchoolManagement() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { data: schools, isLoading } = useSchools();
  const { t } = useLanguage();

  const school = schools?.find(s => s.id === schoolId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!school) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/schools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('schoolManagement.backToSchools')}
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('schoolManagement.noSchoolFound')}</h3>
              <p className="text-gray-600 text-center">{t('schoolManagement.noSchoolDescription')}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/schools')} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('schoolManagement.backToSchools')}</span>
            <span className="sm:hidden">{t('schoolManagement.back')}</span>
          </Button>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('schoolManagement.title')}</h2>
          <p className="text-muted-foreground mt-2">
            <span className="hidden sm:inline">{t('schoolManagement.description', { schoolName: school.name })}</span>
            <span className="sm:hidden">{t('schoolManagement.descriptionShort', { schoolName: school.name })}</span>
          </p>
        </div>

        {/* School Overview */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Building2 className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-2xl truncate">{school.name}</CardTitle>
                  <CardDescription className="truncate">{school.email || t('schoolManagement.noContactEmail')}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getTierColor(school.subscription_tier)}>
                  {t(`schoolManagement.subscriptionTier.${school.subscription_tier}`)}
                </Badge>
                <Badge className={getStatusColor(school.subscription_status)}>
                  {t(`schoolManagement.subscriptionStatus.${school.subscription_status}`)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('schoolManagement.created')}</p>
                <p className="text-sm">{new Date(school.created_at).toLocaleDateString()}</p>
              </div>
              {school.subscription_end && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    <span className="hidden sm:inline">{t('schoolManagement.subscriptionExpires')}</span>
                    <span className="sm:hidden">{t('schoolManagement.expires')}</span>
                  </p>
                  <p className="text-sm">{new Date(school.subscription_end).toLocaleDateString()}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{t('schoolManagement.slug')}</p>
                <p className="text-sm font-mono break-all">{school.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Subscription Management */}
          <SchoolSubscriptionManagement school={school} />

          {/* Admin Management */}
          <SchoolAdminManagement school={school} />

          {/* Managers Management */}
          {/* <SchoolManagersManagement school={school} /> */}
        </div>
      </div>
    </DashboardLayout>
  );
}