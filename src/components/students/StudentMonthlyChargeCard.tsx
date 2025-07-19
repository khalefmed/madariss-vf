import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Calendar, TrendingDown } from 'lucide-react';
import { type GradeLevel } from '@/hooks/useGrades';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentMonthlyChargeCardProps {
  grade: GradeLevel | null;
  discount_percentage: number | null;
}

export default function StudentMonthlyChargeCard({ 
  grade, 
  discount_percentage 
}: StudentMonthlyChargeCardProps) {
  const { t } = useLanguage();

  const discount = discount_percentage || 0;
  const monthlyPrice = grade?.monthly_price || 0;
  const currency = grade?.currency || 'MRU';

  const discountAmount = monthlyPrice * (discount / 100);
  const finalMonthlyCharge = monthlyPrice - discountAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t('payments.monthlyChargeCard.title')}
        </CardTitle>
        <CardDescription>
          {t('payments.monthlyChargeCard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Base Price */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('payments.monthlyChargeCard.basePriceLabel')}
            </p>
            <p className="text-lg font-bold">
              {monthlyPrice.toFixed(2)} {currency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {grade?.name || t('payments.monthlyChargeCard.noGrade')}
            </p>
          </div>

          {/* Discount */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('payments.monthlyChargeCard.discountLabel')}
            </p>
            <p className="text-lg font-bold text-green-600">
              -{discountAmount.toFixed(2)} {currency}
            </p>
            {discount > 0 && (
              <Badge variant="secondary" className="mt-1">
                {t('payments.monthlyChargeCard.discountPercent' + { discount })}
              </Badge>
            )}
          </div>

          {/* Final Charge */}
          <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('payments.monthlyChargeCard.finalChargeLabel')}
            </p>
            <p className="text-xl font-bold text-primary">
              {finalMonthlyCharge.toFixed(2)} {currency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('payments.monthlyChargeCard.chargeDate')}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{t('payments.monthlyChargeCard.howItWorks')}:</strong>{' '}
            {t('payments.monthlyChargeCard.staticExplanation')} {finalMonthlyCharge.toFixed(2)} {currency}{' '}
            {t('payments.monthlyChargeCard.forSubscription')} {grade?.name || t('payments.monthlyChargeCard.currentGrade')}.{' '}
            {t('payments.monthlyChargeCard.calculationNote')} {discount > 0 ? `${t('payments.monthlyChargeCard.minusDiscount')} ${discount}%` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}