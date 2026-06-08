import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import CurrentPlanCard from '../../components/app/features/Billing/CurrentPlanCard';
import PlanComparison from '../../components/app/features/Billing/PlanComparison';
import TransactionHistory from '../../components/app/features/Billing/TransactionHistory';
import { billingAPI } from '../../api/billing';

export default function Billing() {
  const [plans, setPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    billingAPI.getPlans().then(({ data }) => setPlans(data.plans || []));
    billingAPI.getTransactions().then(({ data }) => setTransactions(data.data || []));
  }, []);

  const handleSelectPlan = (plan) => {
    billingAPI.checkout(plan._id);
  };

  return (
    <>
      <PageHeader title="Billing" description="Manage your plan and payment methods" />
      <div className="space-y-6">
        <CurrentPlanCard />
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h3>
          <PlanComparison plans={plans} currentPlan={currentPlan} onSelect={handleSelectPlan} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </>
  );
}