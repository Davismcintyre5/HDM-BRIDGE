import { useEffect, useState } from 'react';
import ProgressBar from '@components/app/ui/ProgressBar';
import { Link } from 'react-router-dom';

export default function UsageCard() {
  const [usage, setUsage] = useState({
    daily: { current: 0, limit: 100 },
    monthly: { current: 0, limit: 3000 },
    plan: 'Free',
  });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/billing/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsage({
          daily: {
            current: data.usage.daily.current || 0,
            limit: data.usage.daily.limit || 100,
          },
          monthly: {
            current: data.usage.monthly.current || 0,
            limit: data.usage.monthly.limit || 3000,
          },
          plan: data.plan || 'Free',
        });
      }
    } catch {}
  };

  const dailyPercent = usage.daily.limit > 0 ? (usage.daily.current / usage.daily.limit) * 100 : 0;
  const monthlyPercent = usage.monthly.limit > 0 ? (usage.monthly.current / usage.monthly.limit) * 100 : 0;

  const formatPercent = (percent) => {
    if (percent < 0.1) return '<0.1%';
    if (percent < 1) return percent.toFixed(1) + '%';
    return Math.round(percent) + '%';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
        <span className="badge bg-indigo-100 text-indigo-700 capitalize">{usage.plan} Plan</span>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Daily Emails</span>
            <span className="text-sm font-medium text-gray-900">
              {usage.daily.current.toLocaleString()} / {usage.daily.limit.toLocaleString()} ({formatPercent(dailyPercent)})
            </span>
          </div>
          <ProgressBar value={usage.daily.current} max={usage.daily.limit} showPercentage={false} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Monthly Emails</span>
            <span className="text-sm font-medium text-gray-900">
              {usage.monthly.current.toLocaleString()} / {usage.monthly.limit.toLocaleString()} ({formatPercent(monthlyPercent)})
            </span>
          </div>
          <ProgressBar value={usage.monthly.current} max={usage.monthly.limit} showPercentage={false} />
        </div>
      </div>
      <Link to="/billing" className="btn-primary btn-sm mt-4 inline-block">Upgrade Plan</Link>
    </div>
  );
}