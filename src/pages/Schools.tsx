import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSchools } from '@/hooks/useSchools';
import { useCreateSchoolWithUser } from '@/hooks/useAdmin';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordDisplayModal from '@/components/auth/PasswordDisplayModal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Schools() {
  const { data: schools, isLoading } = useSchools();
  const createSchoolWithUserMutation = useCreateSchoolWithUser();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    email: string;
    password: string;
    userName: string;
  }>({
    isOpen: false,
    email: '',
    password: '',
    userName: ''
  });
  const navigate = useNavigate();

  const handleCreateSchoolWithUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const schoolName = formData.get('schoolName') as string;
    const schoolSlug = formData.get('schoolSlug') as string;
    const schoolEmail = formData.get('schoolEmail') as string;
    const userEmail = formData.get('userEmail') as string;
    const userFirstName = formData.get('userFirstName') as string;
    const userLastName = formData.get('userLastName') as string;
    const userRole = formData.get('userRole') as 'super_admin' | 'admin';
    
    // Generate secure password
    const generatedPassword = generateSecurePassword(12);
    
    try {
      await createSchoolWithUserMutation.mutateAsync({
        schoolName,
        schoolSlug,
        schoolEmail: schoolEmail || undefined,
        userEmail,
        userPassword: generatedPassword,
        userFirstName,
        userLastName,
        userRole
      });
      
      // Show password modal
      setPasswordModal({
        isOpen: true,
        email: userEmail,
        password: generatedPassword,
        userName: `${userFirstName} ${userLastName}`
      });
      
      setIsDialogOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      // Error is handled by the mutation
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('schools.title')}</h2>
            <p className="text-muted-foreground">{t('schools.description')}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('schools.addSchoolAndAdmin')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('schools.addNewSchoolTitle')}</DialogTitle>
                <DialogDescription>{t('schools.addNewSchoolDescription')}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSchoolWithUser} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">{t('schools.schoolInformation')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">{t('schools.schoolName')}</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        placeholder={t('schools.schoolNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolSlug">{t('schools.schoolSlug')}</Label>
                      <Input
                        id="schoolSlug"
                        name="schoolSlug"
                        placeholder={t('schools.schoolSlugPlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolEmail">{t('schools.schoolEmail')}</Label>
                    <Input
                      id="schoolEmail"
                      name="schoolEmail"
                      type="email"
                      placeholder={t('schools.schoolEmailPlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">{t('schools.adminUser')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userFirstName">{t('schools.userFirstName')}</Label>
                      <Input
                        id="userFirstName"
                        name="userFirstName"
                        placeholder={t('schools.userFirstNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userLastName">{t('schools.userLastName')}</Label>
                      <Input
                        id="userLastName"
                        name="userLastName"
                        placeholder={t('schools.userLastNamePlaceholder')}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">{t('schools.userEmail')}</Label>
                    <Input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      placeholder={t('schools.userEmailPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userRole">{t('schools.userRole')}</Label>
                    <Select name="userRole" defaultValue="super_admin" required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('schools.selectUserRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">{t('schools.superAdmin')}</SelectItem>
                        <SelectItem value="admin">{t('schools.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>{t('schools.note')}</strong> {t('schools.passwordNote')}
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createSchoolWithUserMutation.isPending}
                >
                  {createSchoolWithUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('schools.createSchoolAndAdmin')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schools Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schools && schools.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Card key={school.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{school.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getTierColor(school.subscription_tier)}>
                        {t(`schools.subscriptionTier.${school.subscription_tier}`)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {school.email || t('schools.noContactEmail')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('schools.status')}</span>
                      <Badge className={getStatusColor(school.subscription_status)}>
                        {t(`schools.subscriptionStatus.${school.subscription_status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('schools.created')}</span>
                      <span>{new Date(school.created_at).toLocaleDateString()}</span>
                    </div>
                    {school.subscription_end && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('schools.expires')}</span>
                        <span>{new Date(school.subscription_end).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/dashboard/schools/${school.id}/manage`)}
                    >
                      {t('schools.manageSchool')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('schools.noSchoolsFound')}</h3>
              <p className="text-gray-600 text-center mb-4">{t('schools.noSchoolsDescription')}</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('schools.addFirstSchool')}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <PasswordDisplayModal
          isOpen={passwordModal.isOpen}
          onClose={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
          email={passwordModal.email}
          password={passwordModal.password}
          userName={passwordModal.userName}
        />
      </div>
    </DashboardLayout>
  );
}