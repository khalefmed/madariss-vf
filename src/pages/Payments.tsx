import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStudents } from '@/hooks/useStudents';
import { useStudentPayments } from '@/hooks/useStudentPayments';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Search, Plus, AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StudentPaymentForm from '@/components/payments/StudentPaymentForm';
import StudentPaymentsTable from '@/components/payments/StudentPaymentsTable';
import StudentBalanceCard from '@/components/students/StudentBalanceCard';
import StudentMonthlyChargeCard from '@/components/students/StudentMonthlyChargeCard';
import type { StudentPayment } from '@/hooks/useStudentPayments';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Payments() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin';
  const isAccountant = userRole?.role === 'accountant';
  const isStudent = userRole?.role === 'student';

  // Fetch current student's info if user is a student with complete grade data
  const { data: currentStudentInfo } = useQuery({
    queryKey: ['current-student-info', user?.id],
    queryFn: async () => {
      if (!user || !isStudent) return null;

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          grade_levels(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching current student info:', error);
        return null;
      }

      console.log('Current student info with complete grade data:', data);
      console.log('Grade levels data:', data?.grade_levels);
      return data;
    },
    enabled: !!user && isStudent
  });

  // For students, use their own student ID; for admin/accountant, use selected student
  const targetStudentId = isStudent ? currentStudentInfo?.id : selectedStudentId;
  const { data: payments, isLoading: paymentsLoading } = useStudentPayments(targetStudentId);

  console.log('Payments page - User role:', userRole?.role);
  console.log('Payments page - Target student:', targetStudentId);
  console.log('Payments page - Current student grade data:', currentStudentInfo?.grade_levels);
  console.log('Payments page - Payments:', payments);

  // Search for student by ID or NNI
  const handleStudentSearch = async () => {
    if (!studentSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          grade_levels(*)
        `)
        .or(`student_id.ilike.%${studentSearchQuery}%,national_id.ilike.%${studentSearchQuery}%`)
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('Error searching students:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudentId(student.id);
    setStudentSearchQuery(`${student.first_name} ${student.last_name} (${student.student_id})`);
    setSearchResults([]);
  };

  const selectedStudent = isStudent ? currentStudentInfo : students?.find(s => s.id === selectedStudentId);

  console.log('Selected student:', selectedStudent);
  console.log('Selected student grade_levels:', selectedStudent?.grade_levels);

  const handlePrintPayments = (paymentsData: StudentPayment[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const studentInfo = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})` : 'Unknown Student';
    const totalAmount = paymentsData.reduce((sum, payment) => sum + Number(payment.amount), 0);

    const printContent = `
      <html>
        <head>
          <title>Payment History - ${studentInfo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .student-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; margin-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment History Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="student-info">
            <h2>Student: ${studentInfo}</h2>
            <p>Current Balance: ${selectedStudent?.balance || 0} MRU</p>
            ${selectedStudent?.discount_percentage ? `<p>Discount: ${selectedStudent.discount_percentage}%</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Label</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsData.map(payment => `
                <tr>
                  <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>${payment.label}</td>
                  <td>${Number(payment.amount).toFixed(2)} MRU</td>
                  <td>${payment.payment_method}</td>
                  <td>${payment.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Payments: ${paymentsData.length}</p>
            <p>Total Amount: ${totalAmount.toFixed(2)} MRU</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPayments = (paymentsData: StudentPayment[]) => {
    const csvContent = [
      ['Date', 'Label', 'Amount', 'Payment Method', 'Notes'],
      ...paymentsData.map(payment => [
        new Date(payment.payment_date).toLocaleDateString(),
        payment.label,
        Number(payment.amount).toFixed(2),
        payment.payment_method,
        payment.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${selectedStudent?.student_id || 'student'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (userRoleLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-pulse">{t('common.loading')}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin && !isAccountant && !isStudent) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('absences.accessRestricted')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('payments.accessRestrictedDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Student view - show only their payment history and balance
  if (isStudent) {
    if (!currentStudentInfo) {
      return (
        <DashboardLayout>
          <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('payments.studentRecordNotFound')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('payments.studentRecordNotFoundDesc')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      );
    }

    console.log('Student view - grade data being passed to card:', currentStudentInfo.grade_levels);

    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('payments.myPaymentHistory')}</h2>
              <p className="text-muted-foreground mt-2">
                {t('payments.viewPaymentHistory')}
              </p>
            </div>
          </div>

          {/* Student Balance and Monthly Charge Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentBalanceCard 
              balance={currentStudentInfo.balance}
              discount_percentage={currentStudentInfo.discount_percentage}
              grade={currentStudentInfo.grade_levels as any}
            />
            
            <StudentMonthlyChargeCard
              grade={currentStudentInfo.grade_levels as any}
              discount_percentage={currentStudentInfo.discount_percentage}
            />
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('payments.paymentHistory')}
              </CardTitle>
              <CardDescription>
                {t('payments.allPaymentsRecorded')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">{t('payments.loadingPaymentHistory')}</div>
                </div>
              ) : (
                <StudentPaymentsTable
                  payments={payments || []}
                  onPrint={handlePrintPayments}
                  onExport={handleExportPayments}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Admin/Accountant view - can manage all student payments
  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{t('payments.title')}</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t('payments.description')}
            </p>
          </div>
        </div>

        {/* Student Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('payments.selectStudent')}
            </CardTitle>
            <CardDescription>
              Saisissez l'ID étudiant ou le NNI pour rechercher un étudiant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Saisissez l'ID étudiant ou le NNI..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
                />
              </div>
              <Button 
                onClick={handleStudentSearch}
                disabled={isSearching || !studentSearchQuery.trim()}
                className="sm:w-auto w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Résultats de recherche:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.student_id} | NNI: {student.national_id || 'Non renseigné'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {studentSearchQuery && searchResults.length === 0 && !isSearching && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Aucun étudiant trouvé avec cet ID ou NNI.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Selected Student Info & Balance */}
        {selectedStudent && (
          <div className="responsive-stats-grid lg:grid-cols-3">
            <StudentBalanceCard 
              balance={selectedStudent.balance}
              discount_percentage={selectedStudent.discount_percentage}
              grade={selectedStudent.grade_levels as any}
            />

            <StudentMonthlyChargeCard
              grade={selectedStudent.grade_levels as any}
              discount_percentage={selectedStudent.discount_percentage}
            />

            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Plus className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('payments.addPayment')}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('payments.recordNewPayment')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="responsive-dialog max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('payments.addPayment')}</DialogTitle>
                  <DialogDescription>
                    {t('payments.recordNewPayment')} {selectedStudent.first_name} {selectedStudent.last_name}
                  </DialogDescription>
                </DialogHeader>
                <StudentPaymentForm
                  studentId={selectedStudent.id}
                  schoolId={selectedStudent.school_id}
                  onSuccess={() => setIsAddPaymentOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Payment History */}
        {selectedStudentId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('payments.paymentHistory')}
              </CardTitle>
              <CardDescription>
                {t('payments.allPaymentsRecorded')} {selectedStudent?.first_name} {selectedStudent?.last_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">{t('payments.loadingPaymentHistory')}</div>
                </div>
              ) : (
                <StudentPaymentsTable
                  payments={payments || []}
                  onPrint={handlePrintPayments}
                  onExport={handleExportPayments}
                />
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
