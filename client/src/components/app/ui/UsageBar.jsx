import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function UsageBar({ collapsed }) {
  const [usage, setUsage] = useState({ current: 0, limit: 3000, plan: 'Free' });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/billing/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsage({
          current: data.usage.monthly.current || 0,
          limit: data.usage.monthly.limit || 3000,
          plan: data.plan || 'Free',
        });
      }
    } catch {}
  };

  if (collapsed) return null;

  const percentage = usage.limit > 0 ? (usage.current / usage.limit) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Monthly Usage</span>
        <span className="text-xs font-medium text-gray-700">
          {percentage < 0.1 ? '<0.1%' : `${Math.round(percentage)}%`}
        </span>
      </div>
      <ProgressBar value={usage.current} max={usage.limit} showPercentage={false} />
      <p className="text-xs text-gray-400 mt-1">
        {usage.current.toLocaleString()} / {usage.limit.toLocaleString()} emails
      </p>
      <p className="text-xs text-gray-400 mt-0.5 capitalize">{usage.plan} Plan</p>
    </div>
  );
}