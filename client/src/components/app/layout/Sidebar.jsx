import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import NavItem from './NavItem';
import UsageBar from '@components/app/ui/UsageBar';
import { FiHome, FiSend, FiKey, FiGlobe, FiMail, FiFileText, FiList, FiCreditCard, FiUsers, FiSettings, FiCode, FiChevronLeft, FiChevronRight, FiSmartphone, FiMessageSquare, FiInbox } from 'react-icons/fi';

const navItems = [
  { icon: FiHome, label: 'Dashboard', to: '/dashboard' },
  { icon: FiSend, label: 'Compose', to: '/compose' },
  { icon: FiSmartphone, label: 'Send SMS', to: '/sms/send' },
  { icon: FiInbox, label: 'SMS Wallet', to: '/sms/wallet' },
  { icon: FiMessageSquare, label: 'SMS Logs', to: '/sms/logs' },
  { icon: FiKey, label: 'API Keys', to: '/api-keys' },
  { icon: FiGlobe, label: 'Domains', to: '/domains' },
  { icon: FiMail, label: 'Senders', to: '/senders' },
  { icon: FiFileText, label: 'Templates', to: '/templates' },
  { icon: FiList, label: 'Logs', to: '/logs' },
  { icon: FiCreditCard, label: 'Billing', to: '/billing' },
  { icon: FiUsers, label: 'Team', to: '/team' },
  { icon: FiCode, label: 'Developers', to: '/developers' },
  { icon: FiSettings, label: 'Settings', to: '/settings' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Close mobile drawer when route changes
  useEffect(() => {
    if (mobileOpen && onClose) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col transition-all duration-300
          fixed inset-y-0 left-0 z-50 md:static md:z-auto
          ${collapsed ? 'md:w-20' : 'md:w-64'}
          w-64 md:w-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-gray-900">HDM BRIDGE</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg hidden md:inline-flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              collapsed={collapsed}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <UsageBar collapsed={collapsed} />
          <div className="mt-4 flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role || 'member'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}