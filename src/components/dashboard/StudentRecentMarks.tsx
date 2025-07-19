import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentDashboardStats } from '@/hooks/useStudentDashboardStats';
import { Calculator, TrendingUp } from 'lucide-react';

export function StudentRecentMarks() {
  const { data, isLoading } = useStudentDashboardStats();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mes Dernières Notes
          </CardTitle>
          <CardDescription>Évolution de mes performances récentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentMarks = data?.recentMarks || [];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Mes Dernières Notes
        </CardTitle>
        <CardDescription>
          {recentMarks.length > 0 
            ? `Mes ${recentMarks.length} dernières évaluations`
            : 'Aucune note récente disponible'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentMarks.length > 0 ? (
          <div className="space-y-4">
            {recentMarks.map((mark, index) => {
              const normalizedMark = mark.mark && mark.max_mark 
                ? (mark.mark / mark.max_mark) * 20 
                : 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{mark.classes?.name || 'Matière'}</p>
                    <p className="text-xs text-muted-foreground">
                      {mark.entered_at && new Date(mark.entered_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      normalizedMark >= 16 ? 'default' :
                      normalizedMark >= 14 ? 'secondary' :
                      normalizedMark >= 12 ? 'outline' : 'destructive'
                    }>
                      {mark.mark !== null && mark.max_mark 
                        ? `${mark.mark}/${mark.max_mark}` 
                        : 'N/A'
                      }
                    </Badge>
                    <Badge variant={mark.mark_type === 'exam' ? 'default' : 'secondary'}>
                      {mark.mark_type === 'exam' ? 'Examen' : 'Contrôle'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune note récente à afficher</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}