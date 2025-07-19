import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { StudentPayment } from '@/hooks/useStudentPayments';
import { useLanguage } from '@/contexts/LanguageContext';

interface StudentPaymentsTableProps {
  payments: StudentPayment[];
  onPrint?: (payments: StudentPayment[]) => void;
  onExport?: (payments: StudentPayment[]) => void;
}

export default function StudentPaymentsTable({
  payments,
  onPrint,
  onExport
}: StudentPaymentsTableProps) {
  const { t } = useLanguage();
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('payments.table.noPayments')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            {t('payments.table.totalPayments')+  payments.length}
          </p>
          <p className="text-base sm:text-lg font-semibold">
            {t('payments.table.totalAmount') + totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          {onPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(payments)}
              className="flex-1 sm:flex-initial"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span>{t('payments.table.print')}</span>
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(payments)}
              className="flex-1 sm:flex-initial"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>{t('payments.table.export')}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">{t('payments.table.date')}</TableHead>
              <TableHead className="min-w-[120px]">{t('payments.table.label')}</TableHead>
              <TableHead className="min-w-[100px]">{t('payments.table.amount')}</TableHead>
              <TableHead className="min-w-[100px] hidden sm:table-cell">{t('payments.table.method')}</TableHead>
              <TableHead className="min-w-[120px] hidden md:table-cell">{t('payments.table.year')}</TableHead>
              <TableHead className="min-w-[150px] hidden lg:table-cell">{t('payments.table.notes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-sm">
                  {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{payment.label}</Badge>
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {Number(payment.amount).toFixed(2)} MRU
                </TableCell>
                <TableCell className="text-sm hidden sm:table-cell">
                  {payment.payment_method}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {payment.academic_years?.year_name ? (
                    <span className="text-sm text-gray-600">
                      {payment.academic_years.year_name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {payment.notes && (
                    <span className="text-sm text-gray-600">
                      {payment.notes.length > 50
                        ? `${payment.notes.substring(0, 50)}...`
                        : payment.notes}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}