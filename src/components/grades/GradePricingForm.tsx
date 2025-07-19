import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateGrade, type GradeLevel } from '@/hooks/useGrades';
import { DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GradePricingFormProps {
  grade: GradeLevel;
}

export default function GradePricingForm({ grade }: GradePricingFormProps) {
  const { t } = useLanguage();
  const updateGradeMutation = useUpdateGrade();
  const [monthlyPrice, setMonthlyPrice] = useState(grade.monthly_price?.toString() || '0');
  const [currency, setCurrency] = useState(grade.currency || 'MRU');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateGradeMutation.mutateAsync({
        id: grade.id,
        name: grade.name,
        display_order: grade.display_order,
        monthly_price: Number(monthlyPrice),
        currency: currency
      });
    } catch (error) {
      console.error('Error updating grade pricing:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('grades.pricingTitle')} - {grade.name}
        </CardTitle>
        <CardDescription>
          {t('grades.pricingDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_price">{t('grades.monthlyPrice')}</Label>
              <Input
                id="monthly_price"
                type="number"
                min="0"
                step="0.01"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t('grades.currency')}</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="MRU"
                maxLength={3}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={updateGradeMutation.isPending}
            className="w-full"
          >
            {updateGradeMutation.isPending
              ? t('grades.updating')
              : t('grades.updatePricing')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}