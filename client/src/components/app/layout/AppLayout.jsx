import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatWidget from '@components/app/features/Chat/ChatWidget';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}