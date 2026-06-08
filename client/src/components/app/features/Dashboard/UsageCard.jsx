import { useEffect, useState } from 'react';
import ProgressBar from '../../ui/ProgressBar';
import { Link } from 'react-router-dom';

export default function UsageCard() {
  const [usage, setUsage] = useState({ daily: 0, monthly: 0, plan: 'Free' });
  const [limits, setLimits] = useState({ dailyEmails: 100, monthlyEmails: 3000 });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => { fetchUsage(); }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUsage(data.usage);
        setLimits({ dailyEmails: data.usage.daily.limit, monthlyEmails: data.usage.monthly.limit });
      }
    } catch {}
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
      <div className="space-y-4">
        <ProgressBar value={usage.monthly.current} max={limits.monthlyEmails} label="Monthly Emails" />
        <ProgressBar value={usage.daily.current} max={limits.dailyEmails} label="Daily Emails" />
      </div>
      <Link to="/billing" className="btn-primary btn-sm mt-4 inline-block">Upgrade Plan</Link>
    </div>
  );
}