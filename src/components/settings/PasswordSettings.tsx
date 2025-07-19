import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PasswordSettings() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('current_password') as string;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: t('passwordSettings.mismatchTitle'),
        description: t('passwordSettings.mismatchDesc'),
        variant: 'destructive',
      });
      setIsUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('passwordSettings.shortTitle'),
        description: t('passwordSettings.shortDesc'),
        variant: 'destructive',
      });
      setIsUpdating(false);
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error('Unable to verify current user');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: t('passwordSettings.incorrectCurrent'),
          description: t('passwordSettings.incorrectDesc'),
          variant: 'destructive',
        });
        setIsUpdating(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: t('passwordSettings.successTitle'),
        description: t('passwordSettings.successDesc'),
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: t('passwordSettings.errorTitle'),
        description: error.message || t('passwordSettings.errorDesc'),
        variant: 'destructive',
      });
      console.error('Password update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('passwordSettings.title')}
        </CardTitle>
        <CardDescription>
          {t('passwordSettings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">{t('passwordSettings.currentPassword')}</Label>
            <div className="relative">
              <Input
                id="current_password"
                name="current_password"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder={t('passwordSettings.placeholderCurrent')}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">{t('passwordSettings.newPassword')}</Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder={t('passwordSettings.placeholderNew')}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">{t('passwordSettings.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('passwordSettings.placeholderConfirm')}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>{isUpdating ? t('passwordSettings.updating') : t('passwordSettings.updateButton')}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}