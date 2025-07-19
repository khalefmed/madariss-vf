
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear } from '@/hooks/useAcademicYears';
import { Plus, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AcademicYears() {
  const { data: academicYears, isLoading } = useAcademicYears();
  const createAcademicYearMutation = useCreateAcademicYear();
  const updateAcademicYearMutation = useUpdateAcademicYear();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleCreateAcademicYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const yearData = {
      year_name: formData.get('year_name') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      is_active: formData.get('is_active') === 'on',
      is_current: formData.get('is_current') === 'on',
    };
    
    try {
      await createAcademicYearMutation.mutateAsync(yearData);
      setIsDialogOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleToggleCurrent = async (yearId: string, isCurrent: boolean) => {
    try {
      await updateAcademicYearMutation.mutateAsync({
        yearId,
        updates: { is_current: isCurrent }
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleToggleActive = async (yearId: string, isActive: boolean) => {
    try {
      await updateAcademicYearMutation.mutateAsync({
        yearId,
        updates: { is_active: isActive }
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('academicYears.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('academicYears.description')}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t('academicYears.addAcademicYear')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('academicYears.addNewAcademicYear')}</DialogTitle>
                <DialogDescription>
                  {t('academicYears.createNewYear')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAcademicYear} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year_name">{t('academicYears.yearName')}</Label>
                  <Input
                    id="year_name"
                    name="year_name"
                    placeholder={t('academicYears.yearNamePlaceholder')}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">{t('academicYears.startDate')}</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">{t('academicYears.endDate')}</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">{t('academicYears.active')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    name="is_current"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_current">{t('academicYears.setAsCurrent')}</Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createAcademicYearMutation.isPending}
                >
                  {createAcademicYearMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('academicYears.createAcademicYear')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Academic Years Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ) : academicYears && academicYears.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                {t('academicYears.title')}
              </CardTitle>
              <CardDescription>
                {t('academicYears.manageYears')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">{t('academicYears.yearName')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('academicYears.startDate')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('academicYears.endDate')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('common.status')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('academicYears.current')}</TableHead>
                      <TableHead className="whitespace-nowrap">{t('academicYears.active')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicYears.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-medium">{year.year_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(year.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{new Date(year.end_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={year.is_active ? "default" : "secondary"}>
                            {year.is_active ? t('academicYears.active') : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={year.is_current}
                            onCheckedChange={(checked) => handleToggleCurrent(year.id, checked)}
                            disabled={updateAcademicYearMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={year.is_active}
                            onCheckedChange={(checked) => handleToggleActive(year.id, checked)}
                            disabled={updateAcademicYearMutation.isPending}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('academicYears.noYearsFound')}</h3>
              <p className="text-gray-600 text-center mb-4">
                {t('academicYears.getStarted')}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('academicYears.addFirstYear')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
