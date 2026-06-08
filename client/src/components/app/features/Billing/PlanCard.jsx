export default function PlanCard({ plan, current, onSelect }) {
  const isCurrent = current === plan.tier;

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
      <p className="text-sm text-gray-500 text-center mt-1">{plan.limits?.monthlyEmails?.toLocaleString()} emails</p>
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
      <button onClick={() => onSelect(plan)} disabled={isCurrent}
        className={`btn w-full ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : plan.metadata?.isRecommended ? 'btn-primary' : 'btn-secondary'}`}>
        {isCurrent ? 'Current Plan' : plan.price?.amount === 0 ? 'Get Started' : 'Upgrade'}
      </button>
    </div>
  );
}