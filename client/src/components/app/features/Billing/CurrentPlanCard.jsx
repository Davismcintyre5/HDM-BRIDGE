import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { billingAPI } from '@api/billing';

export default function CurrentPlanCard() {
  const [subscription, setSubscription] = useState(null);
  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const { data } = await billingAPI.getSubscription();
      setSubscription(data.subscription);
    } catch {
      setSubscription(null);
    }
    setLoading(false);
  };

  const fetchPendingInvoice = async () => {
    try {
      const res = await billingAPI.getTransactions(1);
      const list = res?.data?.data || [];
      const pending = list.find((t) => t.status === 'pending');
      setPendingInvoice(pending || null);
    } catch {}
  };

  useEffect(() => {
    fetchSubscription();
    fetchPendingInvoice();
    const interval = setInterval(() => {
      fetchSubscription();
      fetchPendingInvoice();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-2">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  const planName = subscription?.planId?.name || 'Free';
  const status = subscription?.status || 'active';
  const periodEnd = subscription?.currentPeriodEnd;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{planName}</p>
          <p className="text-sm text-gray-500 capitalize">{status}</p>
          {periodEnd && (
            <p className="text-xs text-gray-400 mt-1">Renews: {new Date(periodEnd).toLocaleDateString()}</p>
          )}
        </div>
        {planName === 'Free' && (
          <a href="#plans" className="btn-primary btn-sm">Upgrade</a>
        )}
      </div>

      {pendingInvoice && pendingInvoice.invoiceNumber && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">You have a pending payment</p>
          <Link
            to={`/invoice/${pendingInvoice.invoiceNumber}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            View invoice →
          </Link>
        </div>
      )}
    </div>
  );
}