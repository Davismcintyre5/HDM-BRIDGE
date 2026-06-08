import { Link } from 'react-router-dom';

const defaultFeatures = {
  free: ['3,000 emails/month', '2 API keys', '1 domain', '5 templates', '7 days log retention', 'Basic analytics'],
  pro: ['50,000 emails/month', '10 API keys', '3 domains', '50 templates', '30 days log retention', 'Webhooks', 'Advanced analytics', 'Custom DKIM'],
  proplus: ['500,000+ emails/month', 'Unlimited API keys', 'Unlimited domains', 'Unlimited templates', '90 days log retention', 'Priority support', 'White-label', 'Team management'],
};

export default function PricingCard({ plan }) {
  const features = defaultFeatures[plan.tier] || defaultFeatures.free;
  const price = plan.convertedPrice?.formatted || `$${plan.price?.amount || 0}`;
  const emails = plan.limits?.monthlyEmails?.toLocaleString() || '0';

  return (
    <div className={`card relative flex flex-col ${plan.metadata?.isRecommended ? 'ring-2 ring-indigo-600 scale-105' : ''}`}>
      {plan.metadata?.isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
          {plan.metadata?.badge || 'Popular'}
        </span>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900">{price}</span>
          <span className="text-gray-400 ml-1">/month</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{emails} emails/month</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start text-sm text-gray-600">
            <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`btn w-full rounded-lg py-3 text-center ${plan.metadata?.isRecommended ? 'btn-primary' : 'btn-secondary'}`}
      >
        {plan.price?.amount === 0 ? 'Get Started' : 'Start Free Trial'}
      </Link>
    </div>
  );
}