
import type { Student } from '@/hooks/useStudents';

export interface StudentListItem {
  id: string;
  name: string;
  grade: string;
  parentPhone: string;
  status: string;
}

export function prepareStudentListForExport(students: Student[]): StudentListItem[] {
  return students.map(student => ({
    id: student.student_id,
    name: `${student.first_name} ${student.last_name}`,
    grade: student.grade_levels?.name || 'No grade assigned',
    parentPhone: student.parent_phone || 'Not provided',
    status: student.is_active ? 'Active' : 'Inactive'
  }));
}

export function generatePrintableHTML(students: StudentListItem[], title: string = 'Student List'): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .date { text-align: right; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-active { color: #22c55e; font-weight: bold; }
        .status-inactive { color: #ef4444; font-weight: bold; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="date">Generated on: ${currentDate}</div>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>Parent Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td>${student.id}</td>
              <td>${student.name}</td>
              <td>${student.grade}</td>
              <td>${student.parentPhone}</td>
              <td class="status-${student.status.toLowerCase()}">${student.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: center; color: #666;">
        Total students: ${students.length}
      </div>
    </body>
    </html>
  `;
}

export function printStudentList(students: StudentListItem[], title?: string): void {
  const htmlContent = generatePrintableHTML(students, title);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

export function downloadStudentListAsHTML(students: StudentListItem[], filename: string = 'student-list.html'): void {
  const htmlContent = generatePrintableHTML(students, 'Student List');
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function downloadStudentListAsCSV(students: StudentListItem[], filename: string = 'student-list.csv'): void {
  const headers = ['Student ID', 'Name', 'Grade', 'Parent Phone', 'Status'];
  const csvContent = [
    headers.join(','),
    ...students.map(student => [
      student.id,
      `"${student.name}"`,
      `"${student.grade}"`,
      `"${student.parentPhone}"`,
      student.status
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
