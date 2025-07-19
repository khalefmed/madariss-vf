import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSchoolAdmins, useCreateSchoolAdmin, useDeleteSchoolAdmin, useResetUserPassword } from '@/hooks/useSchoolAdminManagement';
import { UserPlus, Key, Trash2, Loader2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Tables } from '@/integrations/supabase/types';
import { generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordDisplayModal from '@/components/auth/PasswordDisplayModal';

type School = Tables<'schools'>;

interface SchoolAdminManagementProps {
  school: School;
}

export default function SchoolAdminManagement({ school }: SchoolAdminManagementProps) {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'admin' as 'admin' | 'super_admin'
  });
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

  const { data: admins, isLoading } = useSchoolAdmins(school.id);
  const createAdminMutation = useCreateSchoolAdmin();
  const deleteAdminMutation = useDeleteSchoolAdmin();
  const resetPasswordMutation = useResetUserPassword();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate secure password
    const generatedPassword = generateSecurePassword(12);
    
    try {
      await createAdminMutation.mutateAsync({
        ...newAdminData,
        password: generatedPassword,
        schoolId: school.id
      });
      
      // Show password modal
      setPasswordModal({
        isOpen: true,
        email: newAdminData.email,
        password: generatedPassword,
        userName: `${newAdminData.firstName} ${newAdminData.lastName}`
      });
      
      setNewAdminData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'admin'
      });
      setShowAddDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteAdmin = async (userId: string) => {
    try {
      await deleteAdminMutation.mutateAsync({ userId, schoolId: school.id });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ userId, email });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('schoolAdmins.title')}
            </CardTitle>
            <CardDescription>
              {t('schoolAdmins.description', { schoolName: school.name })}
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('schoolAdmins.addAdmin')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('schoolAdmins.addNewAdminTitle')}</DialogTitle>
                <DialogDescription>
                  {t('schoolAdmins.addNewAdminDescription', { schoolName: school.name })}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('schoolAdmins.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={newAdminData.firstName}
                        onChange={(e) => setNewAdminData({ ...newAdminData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('schoolAdmins.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={newAdminData.lastName}
                        onChange={(e) => setNewAdminData({ ...newAdminData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('schoolAdmins.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">{t('schoolAdmins.role')}</Label>
                    <Select
                      value={newAdminData.role}
                      onValueChange={(value: 'admin' | 'super_admin') => 
                        setNewAdminData({ ...newAdminData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schoolAdmins.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('schoolAdmins.roles.admin')}</SelectItem>
                        <SelectItem value="super_admin">{t('schoolAdmins.roles.super_admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>{t('schoolAdmins.note')}</strong> {t('schoolAdmins.passwordNote')}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    {t('schoolAdmins.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAdminMutation.isPending}
                  >
                    {createAdminMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('schoolAdmins.creating')}
                      </>
                    ) : (
                      t('schoolAdmins.createAdmin')
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : admins && admins.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('schoolAdmins.table.name')}</TableHead>
                <TableHead>{t('schoolAdmins.table.email')}</TableHead>
                <TableHead>{t('schoolAdmins.table.role')}</TableHead>
                <TableHead>{t('schoolAdmins.table.created')}</TableHead>
                <TableHead className="text-right">{t('schoolAdmins.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {admin.profiles?.first_name || t('schoolAdmins.na')} {admin.profiles?.last_name || ''}
                  </TableCell>
                  <TableCell>{admin.profiles?.email || t('schoolAdmins.na')}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(admin.role)}>
                      {t(`schoolAdmins.roles.${admin.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('schoolAdmins.resetPasswordTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('schoolAdmins.resetPasswordDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('schoolAdmins.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleResetPassword(admin.user_id, admin.profiles?.email || '')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {t('schoolAdmins.resetPassword')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

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
                            <AlertDialogTitle>{t('schoolAdmins.deleteAdminTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('schoolAdmins.deleteAdminDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('schoolAdmins.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAdmin(admin.user_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t('schoolAdmins.deleteAdmin')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('schoolAdmins.noAdminsFound')}</h3>
            <p className="text-gray-600">
              {t('schoolAdmins.noAdminsDescription')}
            </p>
          </div>
        )}
      </CardContent>
      
      <PasswordDisplayModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
        email={passwordModal.email}
        password={passwordModal.password}
        userName={passwordModal.userName}
      />
    </Card>
  );
}