import { Link } from 'react-router-dom';

export default function PlanCard({ plan, current, onSelect, pendingInvoice }) {
  const isCurrent = current === plan.tier;
  const isPending = pendingInvoice && String(pendingInvoice.planId) === String(plan._id);
  const hasAnyPending = !!pendingInvoice;

  const getButton = () => {
    if (isCurrent) {
      return { text: 'Current Plan', disabled: true, className: 'bg-gray-100 text-gray-400 cursor-not-allowed' };
    }
    if (isPending) {
      return { text: 'Pending Payment', disabled: true, className: 'bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-not-allowed' };
    }
    if (hasAnyPending) {
      return { text: 'Locked', disabled: true, className: 'bg-gray-100 text-gray-400 cursor-not-allowed', hint: 'Complete your pending invoice first' };
    }

    const tiers = ['free', 'pro', 'proplus', 'enterprise'];
    const currentIndex = tiers.indexOf(current);
    const planIndex = tiers.indexOf(plan.tier);

    if (planIndex < currentIndex) {
      return { text: 'Downgrade', disabled: true, className: 'bg-gray-100 text-gray-400 cursor-not-allowed' };
    }
    if (plan.price?.amount === 0) {
      return { text: 'Current Plan', disabled: true, className: 'bg-gray-100 text-gray-400 cursor-not-allowed' };
    }
    return { text: 'Upgrade', disabled: false, className: plan.metadata?.isRecommended ? 'btn-primary' : 'btn-secondary' };
  };

  const btn = getButton();

  return (
    <div className={`card relative flex flex-col ${plan.metadata?.isRecommended ? 'ring-2 ring-indigo-600' : ''}`}>
      {plan.metadata?.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
          {plan.metadata.badge}
        </span>
      )}
      <h3 className="text-xl font-semibold text-gray-900 text-center">{plan.name}</h3>
      <p className="text-4xl font-extrabold text-gray-900 text-center mt-4">
        {plan.convertedPrice?.formatted || `$${plan.price?.amount}`}
        <span className="text-sm font-normal text-gray-400">/mo</span>
      </p>
      <p className="text-sm text-gray-500 text-center mt-1">
        {plan.limits?.monthlyEmails?.toLocaleString()} emails
      </p>
      <ul className="space-y-2 my-6 flex-1">
        <li className="flex items-center text-sm text-gray-600">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {plan.limits?.apiKeys} API keys
        </li>
        <li className="flex items-center text-sm text-gray-600">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {plan.limits?.domains} domains
        </li>
        <li className="flex items-center text-sm text-gray-600">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {plan.features?.webhooks ? 'Webhooks' : 'Basic tracking'}
        </li>
      </ul>

      {isPending && pendingInvoice?.invoiceNumber ? (
        <div className="space-y-2">
          <button
            disabled
            className={`btn w-full ${btn.className}`}
            title={btn.hint || ''}
          >
            {btn.text}
          </button>
          <Link
            to={`/invoice/${pendingInvoice.invoiceNumber}`}
            className="btn btn-secondary w-full block text-center"
          >
            View Invoice
          </Link>
        </div>
      ) : (
        <button
          onClick={() => !btn.disabled && onSelect(plan)}
          disabled={btn.disabled}
          className={`btn w-full ${btn.className}`}
          title={btn.hint || ''}
        >
          {btn.text}
        </button>
      )}
    </div>
  );
}