import { useEffect, useState, useCallback } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import CurrentPlanCard from '@components/app/features/Billing/CurrentPlanCard';
import PlanComparison from '@components/app/features/Billing/PlanComparison';
import PaymentMethodModal from '@components/app/features/Billing/PaymentMethodModal';
import TransactionHistory from '@components/app/features/Billing/TransactionHistory';
import { billingAPI } from '@api/billing';

export default function Billing() {
  const [plans, setPlans] = useState([]);
  const [methods, setMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [currentTier, setCurrentTier] = useState('free');
  const [refreshKey, setRefreshKey] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchAll = useCallback(async () => {
    try {
      const [plansRes, txRes, subRes] = await Promise.all([
        billingAPI.getPlans(),
        billingAPI.getTransactions(),
        billingAPI.getSubscription().catch(() => ({ data: null })),
      ]);
      setPlans(plansRes.data.plans || []);
      setTransactions(txRes.data.data || []);
      if (subRes?.data?.subscription?.planId?.tier) {
        setCurrentTier(subRes.data.subscription.planId.tier);
      }
    } catch {}
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch(API_URL.replace('/api', '') + '/admin/api/system/payment-methods/public');
      const data = await res.json();
      if (data.success) setMethods(data.methods || []);
    } catch {}
  };

  const checkPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/billing/transactions?status=pending', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      setHasPending(data.success && data.data?.length > 0);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    fetchMethods();
    checkPending();
  }, [refreshKey]);

  const handleSelectPlan = (plan) => {
    if (hasPending) return;
    if (plan.price?.amount === 0) return;
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <>
      <PageHeader title="Billing" description="Manage your plan and payment methods" />
      <div className="space-y-6">
        <div id="plans">
          <CurrentPlanCard key={refreshKey} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
          <PlanComparison plans={plans} currentPlan={currentTier} onSelect={handleSelectPlan} hasAnyPending={hasPending} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>

      <PaymentMethodModal
        isOpen={showPayment}
        onClose={handlePaymentClose}
        plan={selectedPlan}
        methods={methods}
        onSelect={() => {}}
      />
    </>
  );
}