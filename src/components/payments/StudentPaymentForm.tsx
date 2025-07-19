import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  useAddStudentPayment,
  type NewStudentPayment
} from '@/hooks/useStudentPayments';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentPaymentFormProps {
  studentId: string;
  schoolId: string;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  'Bankily',
  'Masrvi',
  'Sedad',
  'Bimbank',
  'Cash',
  'Virement bancaire'
];

export default function StudentPaymentForm({
  studentId,
  schoolId,
  onSuccess
}: StudentPaymentFormProps) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    amount: '',
    payment_method: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    label: '',
    notes: '',
    academic_year_id: ''
  });

  const addPaymentMutation = useAddStudentPayment();

  const { data: academicYears } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching academic years:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!schoolId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.payment_method ||
      !formData.label ||
      !formData.academic_year_id
    ) {
      return;
    }

    const paymentData: NewStudentPayment = {
      student_id: studentId,
      school_id: schoolId,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      label: formData.label,
      notes: formData.notes || null,
      academic_year_id: formData.academic_year_id
    };

    try {
      await addPaymentMutation.mutateAsync(paymentData);
      setFormData({
        amount: '',
        payment_method: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        label: '',
        notes: '',
        academic_year_id: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('payments.form.title')}</CardTitle>
        <CardDescription>{t('payments.form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('payments.form.amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">{t('payments.form.method')}</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('payments.form.methodPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">{t('payments.form.date')}</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academic_year">{t('payments.form.year')}</Label>
              <Select
                value={formData.academic_year_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, academic_year_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('payments.form.yearPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">{t('payments.form.label')}</Label>
            <Input
              id="label"
              placeholder={t('payments.form.labelPlaceholder')}
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('payments.form.notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('payments.form.notesPlaceholder')}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <Button type="submit" disabled={addPaymentMutation.isPending}>
            {addPaymentMutation.isPending
              ? t('payments.form.submitting')
              : t('payments.form.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}