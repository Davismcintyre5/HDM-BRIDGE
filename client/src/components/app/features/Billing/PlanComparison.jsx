import PlanCard from './PlanCard';

export default function PlanComparison({ plans, currentPlan, onSelect, pendingInvoice }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          current={currentPlan}
          onSelect={onSelect}
          pendingInvoice={pendingInvoice}
        />
      ))}
    </div>
  );
}