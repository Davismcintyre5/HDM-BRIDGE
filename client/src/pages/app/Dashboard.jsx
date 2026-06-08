import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import StatGrid from '../../components/app/ui/StatGrid';
import StatCard from '../../components/app/ui/StatCard';
import UsageCard from '../../components/app/features/Dashboard/UsageCard';
import RecentActivity from '../../components/app/features/Dashboard/RecentActivity';
import QuickSend from '../../components/app/features/Dashboard/QuickSend';
import { FiSend, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

export default function Dashboard() {
  const [stats, setStats] = useState({ sent: 0, delivered: 0, bounced: 0, opened: 0 });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/logs/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setStats({
          sent: data.stats.sent || 0,
          delivered: data.stats.delivered || 0,
          bounced: data.stats.bounced || 0,
          opened: data.stats.opened || 0,
        });
      }
    } catch {}
  };

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your email activity" />
      <div className="space-y-6">
        <StatGrid>
          <StatCard icon={FiSend} label="Sent" value={stats.sent} color="indigo" />
          <StatCard icon={FiCheckCircle} label="Delivered" value={stats.delivered} color="green" />
          <StatCard icon={FiTrendingUp} label="Opened" value={stats.opened} color="blue" />
          <StatCard icon={FiAlertCircle} label="Bounced" value={stats.bounced} color="red" />
        </StatGrid>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UsageCard />
            <RecentActivity />
          </div>
          <div>
            <QuickSend />
          </div>
        </div>
      </div>
    </>
  );
}