import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentDashboardStats } from '@/hooks/useStudentDashboardStats';
import { CreditCard, Wallet } from 'lucide-react';

export function StudentPaymentHistory() {
  const { data, isLoading } = useStudentDashboardStats();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mes Paiements
          </CardTitle>
          <CardDescription>Historique des paiements récents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentPayments = data?.recentPayments || [];
  const balance = data?.balance || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MRU',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mes Paiements
        </CardTitle>
        <CardDescription>
          Solde actuel: {formatCurrency(balance)}
          <Badge variant={balance >= 0 ? 'default' : 'destructive'} className="ml-2">
            {balance >= 0 ? 'Créditeur' : 'Débiteur'}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentPayments.length > 0 ? (
          <div className="space-y-4">
            {recentPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Paiement reçu</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    +{formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun paiement récent</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}