import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { billingAPI } from '@api/billing';

export default function SubscriptionBanner() {
  const [frozen, setFrozen] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await billingAPI.getSubscription();
        const sub = res?.data?.subscription;
        if (!cancelled && sub?.status === 'frozen') {
          setFrozen({
            planName: sub.planId?.name || 'Subscription',
            frozenAt: sub.frozenAt,
          });
        } else if (!cancelled) {
          setFrozen(null);
        }
      } catch {
        if (!cancelled) setFrozen(null);
      }
    };

    check();
    const t = setInterval(check, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!frozen) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm truncate">
            Your <strong>{frozen.planName}</strong> plan has been suspended. Renew to restore sending.
          </p>
        </div>
        <Link
          to="/renew"
          className="shrink-0 rounded-md bg-white text-red-700 px-3 py-1 text-xs font-semibold hover:bg-red-50 transition-colors"
        >
          Renew now
        </Link>
      </div>
    </div>
  );
}