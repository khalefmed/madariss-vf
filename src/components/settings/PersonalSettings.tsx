import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, User } from 'lucide-react';
import PasswordSettings from './PasswordSettings';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PersonalSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useLanguage();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: {
      first_name: string;
      last_name: string;
      phone: string;
    }) => {
      if (!user?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          email: user.email,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: t('personalSettings.successTitle'),
        description: t('personalSettings.successDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('personalSettings.errorTitle'),
        description: t('personalSettings.errorDesc'),
        variant: 'destructive',
      });
      console.error('Profile update error:', error);
    },
  });

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const profileData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      phone: formData.get('phone') as string,
    };

    try {
      await updateProfileMutation.mutateAsync(profileData);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('personalSettings.title')}
          </CardTitle>
          <CardDescription>
            {t('personalSettings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('personalSettings.firstName')}</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={profile?.first_name || ''}
                  placeholder={t('personalSettings.placeholderFirstName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t('personalSettings.lastName')}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={profile?.last_name || ''}
                  placeholder={t('personalSettings.placeholderLastName')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('personalSettings.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  {t('personalSettings.emailNote')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('personalSettings.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile?.phone || ''}
                  placeholder={t('personalSettings.placeholderPhone')}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex items-center space-x-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isUpdating ? t('personalSettings.saving') : t('personalSettings.save')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <PasswordSettings />
    </div>
  );
}