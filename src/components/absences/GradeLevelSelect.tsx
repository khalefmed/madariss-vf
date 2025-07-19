
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users } from 'lucide-react';
import { useGrades } from '@/hooks/useGrades';

interface GradeLevelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function GradeLevelSelect({ value, onValueChange, placeholder = "Choose a grade level" }: GradeLevelSelectProps) {
  const { data: grades } = useGrades();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg max-h-64 overflow-y-auto">
        {grades?.map((grade) => (
          <SelectItem 
            key={grade.id} 
            value={grade.id}
            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3 px-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{grade.name}</span>
                  {grade.monthly_price && (
                    <span className="text-xs text-gray-500">
                      {grade.monthly_price} {grade.currency || 'MRU'}/month
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Users className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </SelectItem>
        ))}
        {(!grades || grades.length === 0) && (
          <div className="p-4 text-center text-gray-500">
            No grade levels found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
