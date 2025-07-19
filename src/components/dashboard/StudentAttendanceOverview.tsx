import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentDashboardStats } from '@/hooks/useStudentDashboardStats';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export function StudentAttendanceOverview() {
  const { data, isLoading } = useStudentDashboardStats();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mes Absences
          </CardTitle>
          <CardDescription>Taux d'absence ce mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const absenceRate = data?.absenceRate || 0;

  const getAbsenceColor = (rate: number) => {
    if (rate <= 5) return 'text-green-600';
    if (rate <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAbsenceIcon = (rate: number) => {
    if (rate <= 5) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (rate <= 10) return <Calendar className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getAbsenceMessage = (rate: number) => {
    if (rate <= 2) return 'Excellente assiduité !';
    if (rate <= 5) return 'Très bonne présence';
    if (rate <= 10) return 'Présence correcte';
    if (rate <= 15) return 'Présence à améliorer';
    return 'Attention: trop d\'absences';
  };

  return (
    <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mes Absences
          </CardTitle>
          <CardDescription>Suivi de mes absences ce mois</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getAbsenceColor(absenceRate)}`}>
            {absenceRate}%
          </div>
          <p className="text-sm text-muted-foreground">Taux d'absence</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${absenceRate}%` }}
          />
        </div>
        
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
          {getAbsenceIcon(absenceRate)}
          <span className={`text-sm font-medium ${getAbsenceColor(absenceRate)}`}>
            {getAbsenceMessage(absenceRate)}
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          Basé sur les absences de ce mois
        </div>
      </CardContent>
    </Card>
  );
}