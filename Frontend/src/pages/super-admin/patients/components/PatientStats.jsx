import { ClipboardList } from 'lucide-react';
import StatCard from '@components/cards/StatCard/StatCard';

const PatientStats = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard
      title="Total Patients"
      value={stats.total}
      icon={<ClipboardList size={20} />}
      trend={{ value: 12, positive: true }}
    />
    <StatCard
      title="Active"
      value={stats.active}
      icon={<ClipboardList size={20} />}
      iconBg="bg-emerald-100"
      iconColor="text-emerald-600"
      trend={{ value: 8, positive: true }}
    />
    <StatCard
      title="Inactive"
      value={stats.inactive}
      icon={<ClipboardList size={20} />}
      iconBg="bg-red-100"
      iconColor="text-red-600"
      trend={{ value: 1, positive: false }}
    />
  </div>
);

export default PatientStats;
