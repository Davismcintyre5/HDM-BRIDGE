import { useLocation } from 'react-router-dom';

const labels = {
  dashboard: 'Dashboard',
  compose: 'Compose',
  'api-keys': 'API Keys',
  domains: 'Domains',
  senders: 'Senders',
  templates: 'Templates',
  logs: 'Email Logs',
  billing: 'Billing',
  team: 'Team',
  settings: 'Settings',
};

export default function Breadcrumb() {
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const label = labels[path] || path;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-medium">{label}</span>
    </div>
  );
}