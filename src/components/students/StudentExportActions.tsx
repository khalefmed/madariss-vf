
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Printer } from 'lucide-react';
import { prepareStudentListForExport, printStudentList, downloadStudentListAsHTML, downloadStudentListAsCSV } from '@/utils/studentExport';
import type { Student } from '@/hooks/useStudents';
import type { Tables } from '@/integrations/supabase/types';

type Grade = Tables<'grade_levels'>;

interface StudentExportActionsProps {
  filteredStudents: Student[];
  grades?: Grade[];
  selectedGrade: string;
  statusFilter: string;
  searchTerm: string;
}

export default function StudentExportActions({
  filteredStudents,
  grades,
  selectedGrade,
  statusFilter,
  searchTerm
}: StudentExportActionsProps) {
  const getFilterTitle = () => {
    let title = 'Student List';
    const filters = [];
    
    if (selectedGrade !== 'all') {
      const gradeName = grades?.find(g => g.id === selectedGrade)?.name;
      if (gradeName) filters.push(`Grade: ${gradeName}`);
    }
    
    if (statusFilter !== 'all') {
      filters.push(`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`);
    }
    
    if (searchTerm) {
      filters.push(`Search: ${searchTerm}`);
    }
    
    if (filters.length > 0) {
      title += ` (${filters.join(', ')})`;
    }
    
    return title;
  };

  const handlePrint = () => {
    const exportData = prepareStudentListForExport(filteredStudents);
    const title = getFilterTitle();
    printStudentList(exportData, title);
  };

  const handleDownloadHTML = () => {
    const exportData = prepareStudentListForExport(filteredStudents);
    const filename = `student-list-${new Date().toISOString().split('T')[0]}.html`;
    downloadStudentListAsHTML(exportData, filename);
  };

  const handleDownloadCSV = () => {
    const exportData = prepareStudentListForExport(filteredStudents);
    const filename = `student-list-${new Date().toISOString().split('T')[0]}.csv`;
    downloadStudentListAsCSV(exportData, filename);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleDownloadCSV}>
            Download as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadHTML}>
            Download as HTML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
