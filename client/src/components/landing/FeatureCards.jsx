import { useEffect, useState } from 'react';
import FeatureCard from './FeatureCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fallbackFeatures = [
  { icon: '🔑', title: 'API Keys in Seconds', description: 'Create API keys instantly. Start sending emails and SMS with a single curl command.' },
  { icon: '📱', title: 'SMS API', description: 'Send transactional SMS with prepaid per-message billing. Real-time delivery tracking.' },
  { icon: '📊', title: 'Real-time Tracking', description: 'Monitor opens, clicks, bounces, and SMS delivery status.' },
  { icon: '🌐', title: 'Domain Verification', description: 'Verify domains with SPF, DKIM, and DMARC.' },
  { icon: '📝', title: 'Email Templates', description: 'Create reusable HTML templates with variables.' },
  { icon: '🔔', title: 'Webhooks', description: 'Real-time notifications for email and SMS events.' },
  { icon: '🛡️', title: 'Spam Protection', description: 'Built-in rate limiting and compliance checks.' },
];

export default function FeatureCards() {
  const [features, setFeatures] = useState(fallbackFeatures);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/landing/features`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.success && Array.isArray(d.features) && d.features.length) {
          setFeatures(d.features);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Powerful features to power your email and SMS delivery
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}