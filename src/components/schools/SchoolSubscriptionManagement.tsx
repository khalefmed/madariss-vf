import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUpdateSchoolSubscription } from '@/hooks/useSchoolManagement';
import { Settings, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Tables } from '@/integrations/supabase/types';

type School = Tables<'schools'>;

interface SchoolSubscriptionManagementProps {
  school: School;
}

export default function SchoolSubscriptionManagement({ school }: SchoolSubscriptionManagementProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'cancelled' | 'past_due'>(school.subscription_status);
  const [subscriptionTier, setSubscriptionTier] = useState<'basic' | 'premium' | 'enterprise'>(school.subscription_tier);
  const [subscriptionEnd, setSubscriptionEnd] = useState(
    school.subscription_end ? new Date(school.subscription_end).toISOString().split('T')[0] : ''
  );

  const updateSubscriptionMutation = useUpdateSchoolSubscription();

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSubscriptionMutation.mutateAsync({
        schoolId: school.id,
        subscriptionStatus,
        subscriptionTier,
        subscriptionEnd: subscriptionEnd || undefined,
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="h-5 w-5" />
              <span className="hidden sm:inline">{t('schoolSubscription.title')}</span>
              <span className="sm:hidden">{t('schoolSubscription.titleShort')}</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {t('schoolSubscription.description', { schoolName: school.name })}
            </CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <span className="sm:hidden">{t('schoolSubscription.updateShort')}</span>
                <span className="hidden sm:inline">{t('schoolSubscription.update')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('schoolSubscription.updateTitle')}</DialogTitle>
                <DialogDescription>
                  {t('schoolSubscription.updateDescription', { schoolName: school.name })}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSubscription} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">{t('schoolSubscription.subscriptionStatus')}</Label>
                  <Select 
                    value={subscriptionStatus} 
                    onValueChange={(value) => setSubscriptionStatus(value as 'active' | 'inactive' | 'cancelled' | 'past_due')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('schoolSubscription.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('schoolSubscription.subscriptionStatuses.active')}</SelectItem>
                      <SelectItem value="inactive">{t('schoolSubscription.subscriptionStatuses.inactive')}</SelectItem>
                      <SelectItem value="cancelled">{t('schoolSubscription.subscriptionStatuses.cancelled')}</SelectItem>
                      <SelectItem value="past_due">{t('schoolSubscription.subscriptionStatuses.past_due')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">{t('schoolSubscription.subscriptionTier')}</Label>
                  <Select 
                    value={subscriptionTier} 
                    onValueChange={(value) => setSubscriptionTier(value as 'basic' | 'premium' | 'enterprise')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('schoolSubscription.selectTier')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">{t('schoolSubscription.subscriptionTiers.basic')}</SelectItem>
                      <SelectItem value="premium">{t('schoolSubscription.subscriptionTiers.premium')}</SelectItem>
                      <SelectItem value="enterprise">{t('schoolSubscription.subscriptionTiers.enterprise')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t('schoolSubscription.subscriptionEndDate')}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={subscriptionEnd}
                    onChange={(e) => setSubscriptionEnd(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateSubscriptionMutation.isPending}
                >
                  {updateSubscriptionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('schoolSubscription.updateSubscription')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t('schoolSubscription.currentStatus')}</span>
            <Badge className={getStatusColor(school.subscription_status)}>
              {t(`schoolSubscription.subscriptionStatuses.${school.subscription_status}`)}
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t('schoolSubscription.currentPlan')}</span>
            <Badge className={getTierColor(school.subscription_tier)}>
              {t(`schoolSubscription.subscriptionTiers.${school.subscription_tier}`)}
            </Badge>
          </div>
          
          {school.subscription_end && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">{t('schoolSubscription.expires')}</span>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {new Date(school.subscription_end).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}