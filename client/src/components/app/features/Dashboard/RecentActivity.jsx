import { useEffect, useState } from 'react';
import ActivityItem from './ActivityItem';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/logs?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setActivities(data.data || []);
      } catch {}
    };
    fetchLogs();
  }, []);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (<ActivityItem key={a._id} activity={a} />))}
        </div>
      )}
    </div>
  );
}