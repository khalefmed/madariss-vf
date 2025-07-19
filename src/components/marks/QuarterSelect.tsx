
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useAcademicQuarters } from '@/hooks/useAcademicQuarters';

interface QuarterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAll?: boolean;
}

export default function QuarterSelect({ value, onValueChange, placeholder = "Select Quarter", showAll = false }: QuarterSelectProps) {
  const { data: quarters } = useAcademicQuarters();

  const getQuarterBadgeColor = (quarter: string, isActive: boolean) => {
    if (isActive) return 'bg-green-100 text-green-800 border-green-300';
    switch (quarter) {
      case 'Q1': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Q2': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Q3': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg max-h-64 overflow-y-auto">
        {showAll && (
          <SelectItem 
            value="all"
            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3 px-4 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div> */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">All Quarters</span>
                {/* <span className="text-xs text-gray-500">View combined marks</span> */}
              </div>
            </div>
          </SelectItem>
        )}
        
        {quarters?.map((quarter) => (
          <SelectItem 
            key={quarter.id} 
            value={quarter.id}
            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-3 px-4 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {/* <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div> */}
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{quarter.name}</span>
                  <span className="text-xs text-gray-500">
                    {/* {new Date(quarter.start_date).toLocaleDateString()} - {new Date(quarter.end_date).toLocaleDateString()} */}
                  </span>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Badge className={getQuarterBadgeColor(quarter.quarter, quarter.is_active)}>
                  {quarter.quarter}
                  {quarter.is_active && ' (Active)'}
                </Badge>
              </div> */}
            </div>
          </SelectItem>
        ))}
        
        {(!quarters || quarters.length === 0) && (
          <div className="p-4 text-center text-gray-500">
            No quarters found
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
