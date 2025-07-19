import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { type GradeLevel } from '@/hooks/useGrades';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentBalanceCardProps {
  balance: number | null;
  discount_percentage: number | null;
  grade: GradeLevel | null;
}

export default function StudentBalanceCard({ 
  balance, 
  discount_percentage, 
  grade 
}: StudentBalanceCardProps) {
  const { t } = useLanguage();
  const currentBalance = balance || 0;
  const currency = grade?.currency || 'MRU';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('payments.balanceCard.title')}
        </CardTitle>
        <CardDescription>
          {t('payments.balanceCard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-muted rounded-lg">
          <div className="flex items-center justify-center mb-4">
            {currentBalance >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {t('payments.balanceCard.label')}
          </p>
          <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currentBalance.toFixed(2)} {currency}
          </p>
          
          {currentBalance >= 0 ? (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
              {t('payments.balanceCard.inCredit')}
            </Badge>
          ) : (
            <Badge variant="destructive" className="mt-2">
              {t('payments.balanceCard.paymentRequired')}
            </Badge>
          )}
        </div>

        {currentBalance < 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>{t('payments.balanceCard.notice')}:</strong>{' '}
              {t('payments.balanceCard.negativeMessage' + { amount: Math.abs(currentBalance).toFixed(2), currency })}
            </p>
          </div>
        )}

        {currentBalance > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{t('payments.balanceCard.creditAvailable')}:</strong>{' '}
              {t('payments.balanceCard.positiveMessage')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}