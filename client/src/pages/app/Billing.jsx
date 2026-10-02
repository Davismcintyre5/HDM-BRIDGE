import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@components/app/ui/PageHeader';
import CurrentPlanCard from '@components/app/features/Billing/CurrentPlanCard';
import PlanComparison from '@components/app/features/Billing/PlanComparison';
import TransactionHistory from '@components/app/features/Billing/TransactionHistory';
import { billingAPI } from '@api/billing';

export default function Billing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentTier, setCurrentTier] = useState('free');
  const [pendingInvoice, setPendingInvoice] = useState(null);
  const [creating, setCreating] = useState(false);
  const [refreshKey] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      const [plansRes, txRes, subRes, pendingRes] = await Promise.all([
        billingAPI.getPlans(),
        billingAPI.getTransactions(),
        billingAPI.getSubscription().catch(() => ({ data: null })),
        billingAPI.getPendingInvoice().catch(() => ({ data: null })),
      ]);
      setPlans(plansRes.data.plans || []);
      setTransactions(txRes.data.data || []);
      if (subRes?.data?.subscription?.planId?.tier) {
        setCurrentTier(subRes.data.subscription.planId.tier);
      }
      const pending = pendingRes?.data?.pending ? pendingRes.data.invoice : null;
      setPendingInvoice(pending);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAll();
  }, [refreshKey, fetchAll]);

  const handleSelectPlan = async (plan) => {
    if (pendingInvoice) return;
    if (plan.price?.amount === 0) return;
    setCreating(true);
    try {
      const res = await billingAPI.createInvoice(plan._id);
      const invoiceNumber = res?.data?.invoice?.invoiceNumber || res?.data?.data?.invoice?.invoiceNumber;
      if (invoiceNumber) navigate(`/invoice/${invoiceNumber}`);
      else alert('Could not create invoice');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
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
          <PlanComparison
            plans={plans}
            currentPlan={currentTier}
            onSelect={handleSelectPlan}
            pendingInvoice={pendingInvoice}
          />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </>
  );
}