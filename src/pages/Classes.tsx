
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useClasses, useCreateClass } from '@/hooks/useClasses';
import { useGrades } from '@/hooks/useGrades';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { Plus, BookOpen, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CLASS_OPTIONS = [
  'Mathématiques',
  'Physique-chimie',
  'Sciences naturelles',
  'Instructions religieuses',
  'Instructions civiles',
  'Philosophie',
  'Arabe',
  'Français',
  'Anglais',
  'Histoire-géographie'
];

export default function Classes() {
  const { t } = useLanguage();
  const { data: classes, isLoading } = useClasses();
  const { data: grades } = useGrades();
  const { data: academicYears } = useAcademicYears();
  const createClassMutation = useCreateClass();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const classData = {
      name: selectedClassName,
      grade_id: selectedGradeId,
      academic_year_id: selectedAcademicYearId,
      coefficient: parseFloat(formData.get('coefficient') as string) || 1.0,
    };
    
    try {
      await createClassMutation.mutateAsync(classData);
      setIsDialogOpen(false);
      setSelectedClassName('');
      setSelectedGradeId('');
      setSelectedAcademicYearId('');
      e.currentTarget.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Get current academic year for default selection
  const currentAcademicYear = academicYears?.find(year => year.is_current);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('classes.title')}</h2>
            <p className="text-muted-foreground mt-2">
              {t('classes.description')}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('classes.addClass')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('classes.addNewClass')}</DialogTitle>
                <DialogDescription>
                  {t('classes.createNewClass')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('classes.className')}</Label>
                  <Select value={selectedClassName} onValueChange={setSelectedClassName} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t('classes.selectClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_OPTIONS.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade_id">{t('classes.gradeLevel')}</Label>
                    <Select value={selectedGradeId} onValueChange={setSelectedGradeId} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('classes.selectGradeLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        {grades?.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coefficient">{t('classes.coefficient')}</Label>
                    <Input
                      id="coefficient"
                      name="coefficient"
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      defaultValue="1.0"
                      placeholder="1.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year_id">{t('classes.academicYear')}</Label>
                  <Select 
                    value={selectedAcademicYearId} 
                    onValueChange={setSelectedAcademicYearId}
                    defaultValue={currentAcademicYear?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('classes.selectAcademicYear')} />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year_name} {year.is_current && `(${t('classes.current')})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createClassMutation.isPending || !selectedClassName || !selectedGradeId}
                >
                  {createClassMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('classes.createClass')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : classes && classes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const grade = cls.grade_levels;
              const academicYear = academicYears?.find(year => year.id === cls.academic_year_id);
              
              return (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                      </div>
                      <Badge variant={cls.is_active ? "default" : "secondary"}>
                        {cls.is_active ? t('students.active') : t('students.inactive')}
                      </Badge>
                    </div>
                    <CardDescription>
                      {grade?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('classes.academicYear')}:</span>
                        <span>{academicYear?.year_name || t('classes.notSet')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('classes.coefficient')}:</span>
                        <span>{cls.coefficient || 1.0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('classes.created')}:</span>
                        <span>{new Date(cls.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('classes.noClassesFound')}</h3>
              <p className="text-gray-600 text-center mb-4">
                {t('classes.getStartedByCreating')}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('classes.addFirstClass')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
