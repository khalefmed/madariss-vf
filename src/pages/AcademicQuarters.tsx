
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type AcademicYear = {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  school_id: string;
};

type AcademicQuarter = {
  id: string;
  academic_year_id: string;
  quarter: 'Q1' | 'Q2' | 'Q3';
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_completed: boolean;
  academic_years: AcademicYear;
};

export default function AcademicQuarters() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<AcademicQuarter | null>(null);
  const [formData, setFormData] = useState({
    academic_year_id: '',
    quarter: 'Q1' as 'Q1' | 'Q2' | 'Q3',
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    is_completed: false
  });

  // Fetch academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) return [];
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', userRole.school_id)
        .order('year_name', { ascending: false });

      if (error) throw error;
      return data as AcademicYear[];
    },
    enabled: !!userRole?.school_id
  });

  // Fetch academic quarters
  const { data: quarters, isLoading } = useQuery({
    queryKey: ['academic-quarters', userRole?.school_id],
    queryFn: async () => {
      if (!userRole?.school_id) return [];
      
      const { data, error } = await supabase
        .from('academic_quarters')
        .select(`
          *,
          academic_years(*)
        `)
        .eq('academic_years.school_id', userRole.school_id)
        .order('quarter');

      if (error) {
        console.error('Error fetching academic quarters:', error);
        throw error;
      }
      
      console.log('Academic quarters data:', data);
      return data as AcademicQuarter[];
    },
    enabled: !!userRole?.school_id
  });

  // Create/Update quarter mutation
  const quarterMutation = useMutation({
    mutationFn: async (quarterData: typeof formData) => {
      if (editingQuarter) {
        const { data, error } = await supabase
          .from('academic_quarters')
          .update(quarterData)
          .eq('id', editingQuarter.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('academic_quarters')
          .insert([quarterData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-quarters'] });
      toast.success(editingQuarter ? t('academicQuarters.update') + ' successful' : t('academicQuarters.create') + ' successful');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error saving quarter:', error);
      toast.error('Failed to save quarter');
    }
  });

  // Delete quarter mutation
  const deleteMutation = useMutation({
    mutationFn: async (quarterId: string) => {
      const { error } = await supabase
        .from('academic_quarters')
        .delete()
        .eq('id', quarterId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-quarters'] });
      toast.success('Quarter deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting quarter:', error);
      toast.error('Failed to delete quarter');
    }
  });

  const resetForm = () => {
    setFormData({
      academic_year_id: '',
      quarter: 'Q1',
      name: '',
      start_date: '',
      end_date: '',
      is_active: false,
      is_completed: false
    });
    setEditingQuarter(null);
  };

  const handleEdit = (quarter: AcademicQuarter) => {
    setEditingQuarter(quarter);
    setFormData({
      academic_year_id: quarter.academic_year_id,
      quarter: quarter.quarter,
      name: quarter.name,
      start_date: quarter.start_date,
      end_date: quarter.end_date,
      is_active: quarter.is_active,
      is_completed: quarter.is_completed
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    quarterMutation.mutate(formData);
  };

  const getQuarterBadge = (quarter: string, isActive: boolean, isCompleted: boolean) => {
    let color = 'bg-gray-100 text-gray-800';
    if (isActive) color = 'bg-green-100 text-green-800';
    if (isCompleted) color = 'bg-blue-100 text-blue-800';
    
    return (
      <Badge className={color}>
        {quarter} {isActive && t('academicQuarters.activeStatus')} {isCompleted && t('academicQuarters.completedStatus')}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{t('academicQuarters.title')}</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {t('academicQuarters.description')}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('academicQuarters.addQuarter')}</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="responsive-dialog">
              <DialogHeader>
                <DialogTitle>
                  {editingQuarter ? t('academicQuarters.editQuarter') : t('academicQuarters.createNewQuarter')}
                </DialogTitle>
                <DialogDescription>
                  {editingQuarter ? t('academicQuarters.updateQuarterInfo') : t('academicQuarters.addNewQuarter')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="academic_year_id">{t('academicQuarters.academicYear')}</Label>
                  <Select
                    value={formData.academic_year_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('academicQuarters.selectAcademicYear')} />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears?.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year_name} {year.is_current && `(${t('academicQuarters.currentYear')})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quarter">{t('academicQuarters.quarter')}</Label>
                  <Select
                    value={formData.quarter}
                    onValueChange={(value: 'Q1' | 'Q2' | 'Q3') => setFormData(prev => ({ ...prev, quarter: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">{t('academicQuarters.quarter1')}</SelectItem>
                      <SelectItem value="Q2">{t('academicQuarters.quarter2')}</SelectItem>
                      <SelectItem value="Q3">{t('academicQuarters.quarter3')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">{t('common.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('academicQuarters.quarterNamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-row">
                  <div>
                    <Label htmlFor="start_date">{t('academicQuarters.startDate')}</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">{t('academicQuarters.endDate')}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">{t('academicQuarters.active')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_completed"
                      checked={formData.is_completed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_completed: checked }))}
                    />
                    <Label htmlFor="is_completed">{t('academicQuarters.completed')}</Label>
                  </div>
                </div>

                <div className="responsive-button-group sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="mobile-full-width">
                    {t('academicQuarters.cancel')}
                  </Button>
                  <Button type="submit" disabled={quarterMutation.isPending} className="mobile-full-width">
                    {quarterMutation.isPending ? t('academicQuarters.saving') : (editingQuarter ? t('academicQuarters.update') : t('academicQuarters.create'))}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('academicQuarters.title')}
            </CardTitle>
            <CardDescription>
              {t('academicQuarters.manageQuarters')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">{t('academicQuarters.loadingQuarters')}</div>
            ) : quarters && quarters.length > 0 ? (
              <div className="responsive-table">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="mobile-hide">{t('academicQuarters.academicYear')}</TableHead>
                      <TableHead>{t('academicQuarters.quarter')}</TableHead>
                      <TableHead>{t('common.name')}</TableHead>
                      <TableHead className="mobile-hide">{t('academicQuarters.startDate')}</TableHead>
                      <TableHead className="mobile-hide">{t('academicQuarters.endDate')}</TableHead>
                      <TableHead className="mobile-hide">{t('common.status')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarters.map((quarter) => (
                      <TableRow key={quarter.id}>
                        <TableCell className="font-medium mobile-hide">
                          <div className="mobile-text-sm">
                            {quarter.academic_years.year_name}
                            {quarter.academic_years.is_current && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">{t('academicQuarters.currentYear')}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="sm:hidden">
                            <div className="font-medium">{quarter.quarter}</div>
                            <div className="text-xs text-muted-foreground">{quarter.academic_years.year_name}</div>
                          </div>
                          <div className="hidden sm:block">{quarter.quarter}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quarter.name}</div>
                            <div className="sm:hidden text-xs text-muted-foreground">
                              {new Date(quarter.start_date).toLocaleDateString()} - {new Date(quarter.end_date).toLocaleDateString()}
                            </div>
                            <div className="sm:hidden mt-1">
                              {getQuarterBadge(quarter.quarter, quarter.is_active, quarter.is_completed)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="mobile-hide mobile-text-sm">{new Date(quarter.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="mobile-hide mobile-text-sm">{new Date(quarter.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="mobile-hide">
                          {getQuarterBadge(quarter.quarter, quarter.is_active, quarter.is_completed)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(quarter)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMutation.mutate(quarter.id)}
                              disabled={deleteMutation.isPending}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('academicQuarters.noQuartersFound')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('academicQuarters.getStartedByCreating')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
