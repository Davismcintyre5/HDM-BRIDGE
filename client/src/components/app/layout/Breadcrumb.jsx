import { useLocation } from 'react-router-dom';

const labels = {
  dashboard: 'Dashboard',
  compose: 'Compose',
  sms: 'SMS',
  'sms/send': 'Send SMS',
  'sms/wallet': 'SMS Wallet',
  'sms/logs': 'SMS Logs',
  'api-keys': 'API Keys',
  domains: 'Domains',
  senders: 'Senders',
  templates: 'Templates',
  logs: 'Email Logs',
  billing: 'Billing',
  team: 'Team',
  settings: 'Settings',
  developers: 'Developers',
};

export default function Breadcrumb() {
  const location = useLocation();
  const path = location.pathname.replace(/^\//, '');
  const label = labels[path] || labels[path.split('/')[0]] || path;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-medium">{label}</span>
    </div>
  );
}