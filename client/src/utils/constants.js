export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    monthlyEmails: 3000,
    dailyEmails: 100,
    apiKeys: 2,
    domains: 1,
    senders: 2,
    templates: 5,
  },
  pro: {
    name: 'Pro',
    monthlyEmails: 50000,
    dailyEmails: 2000,
    apiKeys: 10,
    domains: 3,
    senders: 10,
    templates: 50,
  },
  proplus: {
    name: 'Pro+',
    monthlyEmails: 500000,
    dailyEmails: 20000,
    apiKeys: 999,
    domains: 999,
    senders: 999,
    templates: 999,
  },
};

export const EMAIL_STATUSES = {
  queued: { label: 'Queued', color: 'bg-gray-100 text-gray-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Sent', color: 'bg-green-100 text-green-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  opened: { label: 'Opened', color: 'bg-emerald-100 text-emerald-700' },
  clicked: { label: 'Clicked', color: 'bg-teal-100 text-teal-700' },
  bounced: { label: 'Bounced', color: 'bg-red-100 text-red-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  spam: { label: 'Spam', color: 'bg-orange-100 text-orange-700' },
  deferred: { label: 'Deferred', color: 'bg-yellow-100 text-yellow-700' },
};

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];