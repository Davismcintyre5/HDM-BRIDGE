import FeatureCard from './FeatureCard';

const features = [
  {
    icon: '🔑',
    title: 'API Keys in Seconds',
    description: 'Create API keys instantly from your dashboard. Start sending emails with a single curl command.',
  },
  {
    icon: '📊',
    title: 'Real-time Tracking',
    description: 'Monitor opens, clicks, bounces, and delivery status in real-time from your dashboard.',
  },
  {
    icon: '🌐',
    title: 'Domain Verification',
    description: 'Verify your sending domains with SPF, DKIM, and DMARC to ensure maximum deliverability.',
  },
  {
    icon: '📝',
    title: 'Email Templates',
    description: 'Create reusable HTML templates with variables. Duplicate, edit, and manage with ease.',
  },
  {
    icon: '🔄',
    title: 'Webhooks',
    description: 'Receive real-time notifications for email events: delivered, opened, clicked, bounced.',
  },
  {
    icon: '🛡️',
    title: 'Spam Protection',
    description: 'Built-in rate limiting, domain verification, and compliance checks to keep your emails out of spam.',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Powerful features to power your email delivery
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