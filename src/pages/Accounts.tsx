
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AccountsTable from '@/components/accounts/AccountsTable';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Accounts() {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
       
        <AccountsTable />
      </div>
    </DashboardLayout>
  );
}
