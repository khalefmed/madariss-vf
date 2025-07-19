import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSchoolUsers, useCreateUser, useDeleteUser } from '@/hooks/useAdmin';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Trash2, Users, Loader2 } from 'lucide-react';
import { generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordDisplayModal from '@/components/auth/PasswordDisplayModal';

export default function AccountsTable() {
  const { data: schoolUsers, isLoading } = useSchoolUsers();
  const { data: userRole } = useUserRole();
  const { t } = useLanguage();
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();
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

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const role = formData.get('role') as 'admin' | 'teacher' | 'academic_director' | 'accountant' | 'supervisor';
    
    // Generate secure password
    const generatedPassword = generateSecurePassword(12);
    
    if (!userRole?.school_id) return;
    
    try {
      await createUserMutation.mutateAsync({
        email,
        password: generatedPassword,
        firstName,
        lastName,
        schoolId: userRole.school_id,
        role
      });
      
      // Show password modal
      setPasswordModal({
        isOpen: true,
        email,
        password: generatedPassword,
        userName: `${firstName} ${lastName}`
      });
      
      setIsDialogOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'academic_director':
        return 'bg-purple-100 text-purple-800';
      case 'accountant':
        return 'bg-yellow-100 text-yellow-800';
      case 'supervisor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRoleName = (role: string) => {
    const roleKey = `accounts.roles.${role}` as any;
    return t(roleKey) || role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Filter out students (not managed here)
  const nonStudentUsers = schoolUsers?.filter(user => user.role !== 'student') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{t('accounts.title')}</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t('accounts.description')}
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('accounts.addStaffUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('accounts.addNewStaffUser')}</DialogTitle>
              <DialogDescription>
                {t('accounts.createStaffAccount')}. {t('accounts.createUser')}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('accounts.firstName')}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Mohamed"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('accounts.lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Khalef"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('accounts.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="med@ecole.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('accounts.role')}</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('accounts.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('accounts.roles.admin')}</SelectItem>
                    <SelectItem value="teacher">{t('accounts.roles.teacher')}</SelectItem>
                    <SelectItem value="academic_director">{t('accounts.roles.academic_director')}</SelectItem>
                    <SelectItem value="accountant">{t('accounts.roles.accountant')}</SelectItem>
                    <SelectItem value="supervisor">{t('accounts.roles.supervisor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>{t('accounts.note')}:</strong> {t('accounts.securePasswordInfo')}
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('accounts.createUser')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('accounts.staffUsers')}
          </CardTitle>
          <CardDescription>
            {t('accounts.allActiveStaff')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : nonStudentUsers && nonStudentUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('accounts.name')}</TableHead>
                  <TableHead>{t('accounts.email')}</TableHead>
                  <TableHead>{t('accounts.role')}</TableHead>
                  <TableHead>{t('accounts.joined')}</TableHead>
                  <TableHead className="text-right">{t('accounts.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonStudentUsers.map((schoolUser) => (
                  <TableRow key={schoolUser.id}>
                    <TableCell className="font-medium">
                      {schoolUser.profiles 
                        ? `${schoolUser.profiles.first_name || ''} ${schoolUser.profiles.last_name || ''}`.trim() || t('accounts.nameUnavailable')
                        : t('accounts.nameUnavailable')
                      }
                    </TableCell>
                    <TableCell>
                      {schoolUser.profiles?.email || t('accounts.emailUnavailable')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(schoolUser.role)}>
                        {formatRoleName(schoolUser.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schoolUser.joined_at 
                        ? new Date(schoolUser.joined_at).toLocaleDateString()
                        : new Date(schoolUser.created_at).toLocaleDateString()
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('accounts.deactivateUser')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('accounts.deactivateConfirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('accounts.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(schoolUser.user_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t('accounts.deactivate')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('accounts.noStaffFound')}</h3>
              
              <p className="text-gray-600 mb-4">
                {t('accounts.getStarted')}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('accounts.addFirstStaffUser')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordDisplayModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
        email={passwordModal.email}
        password={passwordModal.password}
        userName={passwordModal.userName}
      />
    </div>
  );
}
