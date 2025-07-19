import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGradeDistribution } from '@/hooks/useGradeDistribution';

export function StudentsGradeChart() {
  const { data: gradeData, isLoading } = useGradeDistribution();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Répartition par Niveau</CardTitle>
          <CardDescription>Nombre d'étudiants par niveau scolaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = gradeData || [];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Répartition par Niveau</CardTitle>
        <CardDescription>
          Nombre d'étudiants par niveau scolaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Étudiants']}
                labelFormatter={(label) => `Niveau: ${label}`}
              />
              <Bar 
                dataKey="students" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}