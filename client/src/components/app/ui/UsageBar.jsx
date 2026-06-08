import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import { PLAN_LIMITS } from '../../../utils/constants';

export default function UsageBar({ collapsed }) {
  const [usage, setUsage] = useState({ current: 0, limit: 3000 });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUsage({ current: data.usage.monthly.current, limit: data.usage.monthly.limit });
      }
    } catch {}
  };

  if (collapsed) return null;

  return (
    <div>
      <ProgressBar value={usage.current} max={usage.limit} label="Monthly Usage" />
      <p className="text-xs text-gray-400 mt-1">
        {usage.current.toLocaleString()} / {usage.limit.toLocaleString()} emails
      </p>
    </div>
  );
}