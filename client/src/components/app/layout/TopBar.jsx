import { useAuth } from '../../../context/AuthContext';
import Breadcrumb from './Breadcrumb';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-3">
        {/* Hamburger — mobile only, uses public icon */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <img src="/icon-192.png" alt="" className="h-6 w-6" />
        </button>
        <Breadcrumb />
      </div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  );
}