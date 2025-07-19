
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SchedulesTable from '@/components/schedules/SchedulesTable';

export default function Schedules() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SchedulesTable />
      </div>
    </DashboardLayout>
  );
}
