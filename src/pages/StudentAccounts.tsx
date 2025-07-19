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
import { useStudentAccounts, useCreateStudentAccount, useResetStudentPassword } from '@/hooks/useStudentAccounts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Key, Users, Loader2, UserPlus, Search } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { generateSecurePassword } from '@/utils/passwordGenerator';
import PasswordDisplayModal from '@/components/auth/PasswordDisplayModal';
import { useUserRole } from '@/hooks/useUserRole';

export default function StudentAccounts() {
  const { data: studentAccounts, isLoading } = useStudentAccounts();
  const { data: userRole } = useUserRole();
  const { t } = useLanguage();
  const createAccountMutation = useCreateStudentAccount();
  const resetPasswordMutation = useResetStudentPassword();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalData, setPasswordModalData] = useState({
    email: '',
    password: '',
    userName: ''
  });
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentIdSearch, setStudentIdSearch] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const handleStudentSearch = () => {
    const student = studentAccounts?.find(s => s.student_id === studentIdSearch && !s.hasAccount);
    if (student) {
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStudent || !userRole?.school_id) return;
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    const password = generateSecurePassword(15);
    
    try {
      await createAccountMutation.mutateAsync({
        studentId: selectedStudent.id,
        email,
        password,
        firstName: selectedStudent.first_name,
        lastName: selectedStudent.last_name,
        schoolId: userRole.school_id
      });

      setPasswordModalData({
        email,
        password,
        userName: `${selectedStudent.first_name} ${selectedStudent.last_name}`
      });
      setShowPasswordModal(true);
      setIsCreateDialogOpen(false);
      setSelectedStudent(null);
      setStudentIdSearch('');
      setSearchMode(false);
      e.currentTarget.reset();
    } catch (error) {
      // handle error if needed
    }
  };

  const handleResetPassword = async (userId: string, email: string, studentName: string) => {
    const newPassword = generateSecurePassword(15);
    
    try {
      await resetPasswordMutation.mutateAsync({ userId, email, newPassword });
      
      setPasswordModalData({
        email,
        password: newPassword,
        userName: studentName
      });
      setShowPasswordModal(true);
    } catch (error) {
      // handle error if needed
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordModalData({ email: '', password: '', userName: '' });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedStudent(null);
    setStudentIdSearch('');
    setSearchMode(false);
  };

  const handleCreateAccountForStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchMode(false);
    setIsCreateDialogOpen(true);
  };

  const handleCreateAccountSearch = () => {
    setSelectedStudent(null);
    setSearchMode(true);
    setIsCreateDialogOpen(true);
  };

  const studentsWithoutAccounts = studentAccounts?.filter(student => !student.hasAccount) || [];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{t('studentAccounts.title')}</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t('studentAccounts.description')}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateAccountSearch} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('studentAccounts.createAccountButton')}</span>
                <span className="sm:hidden">{t('studentAccounts.createAccountButtonShort')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="responsive-dialog">
              <DialogHeader>
                <DialogTitle>
                  {searchMode ? t('studentAccounts.dialogTitleSearch') : t('studentAccounts.dialogTitleCreate') + { firstName: selectedStudent?.first_name, lastName: selectedStudent?.last_name }}
                </DialogTitle>
                <DialogDescription>
                  {searchMode 
                    ? t('studentAccounts.dialogDescriptionSearch')
                    : t('studentAccounts.dialogDescriptionCreate') + { firstName: selectedStudent?.first_name, lastName: selectedStudent?.last_name }
                  }
                </DialogDescription>
              </DialogHeader>
              
              {searchMode && !selectedStudent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentIdSearch">{t('studentAccounts.studentIdLabel')}</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="studentIdSearch"
                        value={studentIdSearch}
                        onChange={(e) => setStudentIdSearch(e.target.value)}
                        placeholder={t('studentAccounts.studentIdPlaceholder')}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={handleStudentSearch}
                        disabled={!studentIdSearch.trim()}
                        className="w-full sm:w-auto"
                      >
                        <Search className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('studentAccounts.searchButton')}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {studentIdSearch && !selectedStudent && (
                    <p className="text-sm text-red-600">
                      {t('studentAccounts.noStudentFound')}
                    </p>
                  )}
                </div>
              ) : selectedStudent ? (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      {t('studentAccounts.selectedStudent') +{ firstName: selectedStudent.first_name, lastName: selectedStudent.last_name }}
                    </p>
                    <p className="text-xs text-green-600">
                      {t('studentAccounts.studentDetails')+ { studentId: selectedStudent.student_id, grade: selectedStudent.grade_levels?.name }}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('studentAccounts.emailLabel')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={t('studentAccounts.emailPlaceholder')}
                    />
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {t('studentAccounts.passwordInfo')}
                    </p>
                  </div>

                  <div className="responsive-button-group">
                    {searchMode && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedStudent(null)}
                        className="mobile-full-width"
                      >
                        {t('studentAccounts.backButton')}
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="mobile-full-width"
                      disabled={createAccountMutation.isPending}
                    >
                      {createAccountMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t('studentAccounts.createAccountSubmit')}
                    </Button>
                  </div>
                </form>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>

        {/* Student Accounts Table */}
        <Card>
          <CardHeader>
            
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : studentAccounts && studentAccounts.length > 0 ? (
              <div className="responsive-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="mobile-hide">{t('studentAccounts.tableHeaders.studentId')}</TableHead>
                      <TableHead>{t('studentAccounts.tableHeaders.name')}</TableHead>
                      <TableHead className="mobile-hide">{t('studentAccounts.tableHeaders.grade')}</TableHead>
                      <TableHead className="mobile-hide">{t('studentAccounts.tableHeaders.email')}</TableHead>
                      <TableHead className="mobile-hide">{t('studentAccounts.tableHeaders.accountStatus')}</TableHead>
                      <TableHead className="text-right">{t('studentAccounts.tableHeaders.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAccounts.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium mobile-hide mobile-text-sm">{student.student_id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.first_name} {student.last_name}</div>
                            <div className="sm:hidden text-xs text-muted-foreground mt-1">
                              <div>{t('studentAccounts.mobileView.studentId') + { studentId: student.student_id }}</div>
                              <div>
                                {student.grade_levels ? (
                                  <Badge variant="outline" className="text-xs">{student.grade_levels.name}</Badge>
                                ) : (
                                  <span className="text-gray-400">{t('studentAccounts.unassigned')}</span>
                                )}
                              </div>
                              <div className="text-xs">{student.profile?.email || student.email || t('studentAccounts.noEmail')}</div>
                              <div className="mt-1">
                                {student.hasAccount ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">{t('studentAccounts.activeAccount')}</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">{t('studentAccounts.noAccount')}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="mobile-hide">
                          {student.grade_levels ? (
                            <Badge variant="outline">{student.grade_levels.name}</Badge>
                          ) : (
                            <span className="text-gray-400">{t('studentAccounts.unassigned')}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 mobile-hide">
                          {student.profile?.email || student.email || t('studentAccounts.noEmail')}
                        </TableCell>
                        <TableCell className="mobile-hide">
                          {student.hasAccount ? (
                            <Badge className="bg-green-100 text-green-800">{t('studentAccounts.activeAccount')}</Badge>
                          ) : (
                            <Badge variant="secondary">{t('studentAccounts.noAccount')}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {student.hasAccount && student.user_id ? (
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
                                    <AlertDialogTitle>{t('studentAccounts.resetPasswordTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('studentAccounts.resetPasswordDescription') + { firstName: student.first_name, lastName: student.last_name }}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('studentAccounts.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleResetPassword(
                                        student.user_id!, 
                                        student.profile?.email || student.email || '',
                                        `${student.first_name} ${student.last_name}`
                                      )}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      {t('studentAccounts.reset')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleCreateAccountForStudent(student)}
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
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('studentAccounts.noStudentsTitle')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('studentAccounts.noStudentsDescription')}
                </p>
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