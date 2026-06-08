import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../../ui/ProgressBar';
import { billingAPI } from '../../../api/billing';

export default function CurrentPlanCard() {
  const [subscription, setSubscription] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => { fetchSub(); }, []);

  const fetchSub = async () => {
    try {
      const { data } = await billingAPI.getSubscription();
      setSubscription(data.subscription);
    } catch {}
  };

  if (!subscription) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
        <p className="text-gray-500">Free Plan</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{subscription.planId?.name || 'Free'}</p>
          <p className="text-sm text-gray-500">{subscription.status}</p>
        </div>
        <Link to="/billing" className="btn-secondary btn-sm">Change Plan</Link>
      </div>
    </div>
  );
}