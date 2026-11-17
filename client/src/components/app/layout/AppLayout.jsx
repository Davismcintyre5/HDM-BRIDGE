import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SubscriptionBanner from './SubscriptionBanner';
import ChatWidget from '@components/app/features/Chat/ChatWidget';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* TopBar + banner always on top */}
      <div className="shrink-0">
        <SubscriptionBanner />
        <TopBar onMenuClick={() => setMobileOpen(true)} />
      </div>

      {/* Sidebar (fixed on mobile, static on desktop) + content */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
          {children}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}