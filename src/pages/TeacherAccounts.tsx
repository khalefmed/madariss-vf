import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useTeacherAccounts, useCreateTeacherAccount, useResetTeacherPassword } from '@/hooks/useTeacherAccounts';
import { Plus, Key, Users, Loader2, UserPlus, Search } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordDisplayModal from '@/components/auth/PasswordDisplayModal';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TeacherAccounts() {
  const { t } = useLanguage();
  const { data: teacherAccounts, isLoading } = useTeacherAccounts();
  const { data: userRole } = useUserRole();
  const createAccountMutation = useCreateTeacherAccount();
  const resetPasswordMutation = useResetTeacherPassword();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({
    email: '',
    password: '',
    userName: ''
  });
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const handleTeacherSearch = () => {
    const teacher = teacherAccounts?.find(t => 
      (t.national_number === teacherSearch || t.name.toLowerCase().includes(teacherSearch.toLowerCase())) 
      && !t.hasAccount
    );
    if (teacher) {
      setSelectedTeacher(teacher);
    } else {
      setSelectedTeacher(null);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedTeacher || !userRole?.school_id) return;
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    const password = generateSecurePassword(15);
    
    try {
      await createAccountMutation.mutateAsync({
        teacherId: selectedTeacher.id,
        email,
        password,
        firstName: selectedTeacher.name.split(' ')[0],
        lastName: selectedTeacher.name.split(' ').slice(1).join(' ') || selectedTeacher.name,
        schoolId: userRole.school_id
      });

      setPasswordModalData({
        email,
        password,
        userName: selectedTeacher.name
      });
      setShowPasswordModal(true);
      setIsCreateDialogOpen(false);
      setSelectedTeacher(null);
      setTeacherSearch('');
      setSearchMode(false);
      e.currentTarget.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleResetPassword = async (userId: string, email: string, teacherName: string) => {
    const newPassword = generateSecurePassword(15);
    
    try {
      await resetPasswordMutation.mutateAsync({ userId, email, newPassword });
      
      setPasswordModalData({
        email,
        password: newPassword,
        userName: teacherName
      });
      setShowPasswordModal(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordModalData({ email: '', password: '', userName: '' });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedTeacher(null);
    setTeacherSearch('');
    setSearchMode(false);
  };

  const handleCreateAccountForTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSearchMode(false);
    setIsCreateDialogOpen(true);
  };

  const handleCreateAccountSearch = () => {
    setSelectedTeacher(null);
    setSearchMode(true);
    setIsCreateDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('teacherAccounts.title')}</h2>
            <p className="text-muted-foreground">{t('teacherAccounts.description')}</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateAccountSearch}>
                <Plus className="mr-2 h-4 w-4" />
                {t('teacherAccounts.createAccount')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {searchMode ? t('teacherAccounts.createAccountTitle') : t('teacherAccounts.createAccountForTeacher', { teacherName: selectedTeacher?.name })}
                </DialogTitle>
                <DialogDescription>
                  {searchMode 
                    ? t('teacherAccounts.createAccountDescription') 
                    : t('teacherAccounts.createAccountForTeacherDescription', { teacherName: selectedTeacher?.name })}
                </DialogDescription>
              </DialogHeader>
              
              {searchMode && !selectedTeacher ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherSearch">{t('teacherAccounts.teacherSearchLabel')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="teacherSearch"
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        placeholder={t('teacherAccounts.teacherSearchPlaceholder')}
                      />
                      <Button 
                        type="button" 
                        onClick={handleTeacherSearch}
                        disabled={!teacherSearch.trim()}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {teacherSearch && !selectedTeacher && (
                    <p className="text-sm text-red-600">{t('teacherAccounts.noTeacherFound')}</p>
                  )}
                </div>
              ) : selectedTeacher ? (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {t('teacherAccounts.teacherLabel')}: {selectedTeacher.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {t('teacherAccounts.nationalNumberLabel')}: {selectedTeacher.national_number}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('teacherAccounts.emailLabel')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={t('teacherAccounts.emailPlaceholder')}
                      defaultValue={selectedTeacher.email || ''}
                    />
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {t('teacherAccounts.passwordGenerationMessage')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {searchMode && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedTeacher(null)}
                        className="flex-1"
                      >
                        {t('teacherAccounts.backButton')}
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createAccountMutation.isPending}
                    >
                      {createAccountMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t('teacherAccounts.createAccountButton')}
                    </Button>
                  </div>
                </form>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            {/* <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('teacherAccounts.cardTitle')}
            </CardTitle>
            <CardDescription>{t('teacherAccounts.cardDescription')}</CardDescription> */}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : teacherAccounts && teacherAccounts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('teacherAccounts.table.name')}</TableHead>
                    <TableHead>{t('teacherAccounts.table.nationalNumber')}</TableHead>
                    <TableHead>{t('teacherAccounts.table.phone')}</TableHead>
                    <TableHead>{t('teacherAccounts.table.email')}</TableHead>
                    <TableHead>{t('teacherAccounts.table.accountStatus')}</TableHead>
                    <TableHead className="text-right">{t('teacherAccounts.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherAccounts.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.national_number}</TableCell>
                      <TableCell>{teacher.phone || t('teacherAccounts.noPhone')}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {teacher.hasAccount ? (teacher.profile?.email || t('teacherAccounts.noEmail')) : t('teacherAccounts.noAccount')}
                      </TableCell>
                      <TableCell>
                        {teacher.hasAccount ? (
                          <Badge className="bg-green-100 text-green-800">{t('teacherAccounts.status.active')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('teacherAccounts.status.inactive')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {teacher.hasAccount && teacher.user_id ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  disabled={resetPasswordMutation.isPending}
                                >
                                  {resetPasswordMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Key className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('teacherAccounts.resetPasswordTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('teacherAccounts.resetPasswordDescription', { teacherName: teacher.name })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('teacherAccounts.cancelButton')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleResetPassword(
                                      teacher.user_id!, 
                                      teacher.profile?.email || teacher.email || '',
                                      teacher.name
                                    )}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    {t('teacherAccounts.resetButton')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleCreateAccountForTeacher(teacher)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('teacherAccounts.noTeachersFound')}</h3>
                <p className="text-gray-600 mb-4">{t('teacherAccounts.noTeachersDescription')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <PasswordDisplayModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
          email={passwordModalData.email}
          password={passwordModalData.password}
          userName={passwordModalData.userName}
        />
      </div>
    </DashboardLayout>
  );
}