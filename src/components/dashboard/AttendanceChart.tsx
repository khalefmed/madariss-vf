import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAttendanceStats } from '@/hooks/useAttendanceStats';

export function AttendanceChart() {
  const { data: attendanceData, isLoading } = useAttendanceStats();

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Taux d'Absence</CardTitle>
          <CardDescription>Évolution du taux d'absence cette semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = attendanceData || [];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Taux de Présence</CardTitle>
        <CardDescription>
          Évolution du taux de présence cette semaine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Absence']}
                labelFormatter={(label) => `Jour: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}