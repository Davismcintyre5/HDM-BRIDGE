import { Link } from 'react-router-dom';

export default function NavItem({ icon: Icon, label, to, collapsed, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
      title={collapsed ? label : ''}
    >
      <Icon size={20} />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}