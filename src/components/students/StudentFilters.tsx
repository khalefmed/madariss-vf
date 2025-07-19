import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Grade = Tables<'grade_levels'>;

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  grades?: Grade[];
}

export default function StudentFilters({
  searchTerm,
  setSearchTerm,
  selectedGrade,
  setSelectedGrade,
  statusFilter,
  setStatusFilter,
  grades
}: StudentFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
      <div className="flex items-center space-x-2 flex-1">
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <Input
          placeholder={t('studentFilters.placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 sm:max-w-sm"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('studentFilters.filterByGrade')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('studentFilters.allGrades')}</SelectItem>
            {grades?.map((grade) => (
              <SelectItem key={grade.id} value={grade.id}>
                {grade.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('studentFilters.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('studentFilters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('studentFilters.active')}</SelectItem>
            <SelectItem value="inactive">{t('studentFilters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}