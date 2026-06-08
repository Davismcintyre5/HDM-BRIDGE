import { useState } from 'react';
import { FiBell } from 'react-icons/fi';

export default function NotificationBell() {
  const [hasNotifications] = useState(false);

  return (
    <button className="relative p-2 hover:bg-gray-100 rounded-lg">
      <FiBell size={20} className="text-gray-600" />
      {hasNotifications && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}