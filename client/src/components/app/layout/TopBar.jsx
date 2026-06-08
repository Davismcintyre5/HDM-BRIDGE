import { useAuth } from '../../../context/AuthContext';
import Breadcrumb from './Breadcrumb';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <Breadcrumb />
      <div className="flex items-center space-x-4">
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  );
}