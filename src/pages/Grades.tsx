import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGrades, useCreateGrade, type GradeLevel } from '@/hooks/useGrades';
import { Plus, GraduationCap, DollarSign, Loader2 } from 'lucide-react';
import GradePricingForm from '@/components/grades/GradePricingForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Grades() {
  const { data: grades, isLoading } = useGrades();
  const createGradeMutation = useCreateGrade();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createGradeMutation.mutateAsync({
        name: formData.get('name') as string,
        display_order: parseInt(formData.get('display_order') as string) || 0,
      });
      setIsDialogOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error creating grade:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('grades.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('grades.description')}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t('grades.addGrade')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('grades.createTitle')}</DialogTitle>
                <DialogDescription>
                  {t('grades.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('grades.gradeName')}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t('grades.gradeNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">{t('grades.displayOrder')}</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    placeholder="1"
                    min="0"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createGradeMutation.isPending}
                >
                  {createGradeMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('grades.createGrade')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grade Levels List */}
        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            grades?.map((grade: GradeLevel) => (
              <div key={grade.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {grade.name}
                    </CardTitle>
                    <CardDescription>
                      {t('grades.displayOrder')}: {grade.display_order} | {t('grades.status')}: {grade.is_active ? t('grades.active') : t('grades.inactive')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t('grades.monthlyPrice')}:</span>
                        <span className="text-lg font-bold text-green-600">
                          {grade.monthly_price || 0} {grade.currency || 'MRU'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t('grades.created')}:</span>
                        <span className="text-sm text-gray-500">
                          {new Date(grade.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <GradePricingForm grade={grade} />
              </div>
            ))
          )}

          {!isLoading && (!grades || grades.length === 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('grades.noGradesTitle')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('grades.noGradesDescription')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}