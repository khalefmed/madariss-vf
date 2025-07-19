import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Building2, Mail, Phone, Globe } from 'lucide-react';
import { useSchools } from '@/hooks/useSchools';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SchoolSettings() {
  const { data: schools } = useSchools();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentSchool = schools?.[0];

  const updateSchoolMutation = useMutation({
    mutationFn: async (schoolData: {
      name: string;
      email: string;
      phone: string;
      website: string;
      address: string;
    }) => {
      if (!currentSchool?.id) throw new Error('No school ID');

      const { error } = await supabase
        .from('schools')
        .update({
          name: schoolData.name,
          email: schoolData.email,
          phone: schoolData.phone,
          website: schoolData.website,
          address: schoolData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSchool.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast({
        title: t('schoolSettings.successTitle'),
        description: t('schoolSettings.successDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('schoolSettings.errorTitle'),
        description: t('schoolSettings.errorDesc'),
        variant: 'destructive',
      });
      console.error('School update error:', error);
    },
  });

  const handleUpdateSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const schoolData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
    };

    try {
      await updateSchoolMutation.mutateAsync(schoolData);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentSchool) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('schoolSettings.noSchoolTitle')}</h3>
          <p className="text-gray-600">{t('schoolSettings.noSchoolDesc')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('schoolSettings.title')}
        </CardTitle>
        <CardDescription>
          {t('schoolSettings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateSchool} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('schoolSettings.name')}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={currentSchool.name}
                placeholder={t('schoolSettings.namePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('schoolSettings.email')}</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={currentSchool.email || ''}
                  placeholder={t('schoolSettings.emailPlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('schoolSettings.phone')}</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={currentSchool.phone || ''}
                  placeholder={t('schoolSettings.phonePlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{t('schoolSettings.website')}</Label>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  name="website"
                  defaultValue={currentSchool.website || ''}
                  placeholder={t('schoolSettings.websitePlaceholder')}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t('schoolSettings.address')}</Label>
              <Input
                id="address"
                name="address"
                defaultValue={currentSchool.address || ''}
                placeholder={t('schoolSettings.addressPlaceholder')}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{t('schoolSettings.subscriptionTitle')}</h4>
              <div className="flex items-center space-x-2">
                <Badge variant={currentSchool.subscription_status === 'active' ? "default" : "secondary"}>
                  {t(`schoolSettings.subscription.${currentSchool.subscription_status}`)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentSchool.subscription_tier} {t('schoolSettings.plan')}
                </span>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>
                {isUpdating ? t('schoolSettings.saving') : t('schoolSettings.save')}
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}