
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GraduationCap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import PasswordChangeDialog from './PasswordChangeDialog';

export default function AuthPage() {
  const { user, loading, signIn } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  console.log('🎭 AuthPage: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    pathname: window.location.pathname 
  });

  // Check if user needs to change password on first login
  useEffect(() => {
    if (user && user.user_metadata?.force_password_change) {
      setShowPasswordChange(true);
    }
  }, [user]);

  // Show loading spinner only for a reasonable time
  if (loading) {
    console.log('⏳ AuthPage: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated and password doesn't need changing
  if (user && !showPasswordChange) {
    console.log('🔄 AuthPage: User authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Show password change dialog if needed
  if (user && showPasswordChange) {
    return (
      <PasswordChangeDialog 
        open={showPasswordChange} 
        onPasswordChanged={() => {
          setShowPasswordChange(false);
          // Force a page reload to ensure clean state
          window.location.href = '/dashboard';
        }} 
      />
    );
  }

  console.log('📝 AuthPage: Showing auth form');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔐 AuthPage: Sign in form submitted');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      console.log('🔐 AuthPage: Attempting sign in for:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ AuthPage: Sign in failed:', error.message);
        setError(error.message);
      } else {
        console.log('✅ AuthPage: Sign in successful');
      }
    } catch (err) {
      console.error('💥 AuthPage: Sign in exception:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6 bg-white px-4 py-6 rounded-lg">
        {/* Header with Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        
        <div className="text-center flex align-center justify-center ">
          <img src="/logo.png" className='h-12 text-center' alt="" />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('auth.signIn')}</CardTitle>
            <CardDescription>
              {t('auth.signInDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.enterEmail')}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {t('auth.signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
