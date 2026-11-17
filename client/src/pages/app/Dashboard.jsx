import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import StatGrid from '../../components/app/ui/StatGrid';
import StatCard from '../../components/app/ui/StatCard';
import Card from '../../components/app/ui/Card';
import UsageCard from '../../components/app/features/Dashboard/UsageCard';
import RecentActivity from '../../components/app/features/Dashboard/RecentActivity';
import QuickSend from '../../components/app/features/Dashboard/QuickSend';
import { FiSend, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiSmartphone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { smsAPI } from '@api/sms';
import { formatCurrency } from '@utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState({ sent: 0, delivered: 0, bounced: 0, opened: 0 });
  const [sms, setSms] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
    fetchSmsStats();
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

  const fetchSmsStats = async () => {
    try {
      const res = await smsAPI.getStats();
      const payload = res?.data?.stats;
      if (payload) setSms(payload);
    } catch {}
  };

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your email and SMS activity" />
      <div className="space-y-6">
        <StatGrid>
          <StatCard icon={FiSend} label="Emails sent" value={stats.sent} color="indigo" />
          <StatCard icon={FiCheckCircle} label="Delivered" value={stats.delivered} color="green" />
          <StatCard icon={FiTrendingUp} label="Opened" value={stats.opened} color="blue" />
          <StatCard icon={FiAlertCircle} label="Bounced" value={stats.bounced} color="red" />
        </StatGrid>

        {sms && (
          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FiSmartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">SMS</h3>
              </div>
              <Link to="/sms/wallet" className="text-xs font-medium text-indigo-600 hover:underline">
                Top up →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(sms.balance || 0, 'KES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent today</p>
                <p className="text-lg font-semibold text-gray-900">{sms.todaySent || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sent this month</p>
                <p className="text-lg font-semibold text-gray-900">{sms.monthSent || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total spent</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(sms.totalSpentKes || 0, 'KES')}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <Link to="/sms/send" className="btn-primary btn-sm">Send SMS</Link>
              <Link to="/sms/logs" className="btn-secondary btn-sm">View SMS logs</Link>
            </div>
          </Card>
        )}

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