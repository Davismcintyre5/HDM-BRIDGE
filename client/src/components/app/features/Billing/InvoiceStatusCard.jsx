import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle } from 'react-icons/fi';

const VARIANTS = {
  paid: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-600',
    Icon: FiCheckCircle,
    title: 'Payment received',
    subtitle: 'Your subscription is active.',
  },
  sent: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    Icon: FiClock,
    title: 'Payment pending',
    subtitle: 'Complete payment to activate your plan.',
  },
  expired: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-600',
    Icon: FiXCircle,
    title: 'Invoice expired',
    subtitle: 'Generate a new invoice to try again.',
  },
  failed: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-600',
    Icon: FiAlertCircle,
    title: 'Payment failed',
    subtitle: 'The payment was not completed.',
  },
};

export default function InvoiceStatusCard({ status, note }) {
  const v = VARIANTS[status] || VARIANTS.sent;
  const Icon = v.Icon;

  return (
    <div className={`rounded-lg border ${v.border} ${v.bg} p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${v.iconColor}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${v.text}`}>{v.title}</p>
        <p className={`text-xs mt-0.5 ${v.text} opacity-80`}>{note || v.subtitle}</p>
      </div>
    </div>
  );
}