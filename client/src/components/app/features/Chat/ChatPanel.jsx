import { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatPanel({ messages, loading, onSend, onClose, onClear }) {
  return (
    <div className="fixed bottom-24 right-6 w-80 h-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      <ChatHeader onClose={onClose} onClear={onClear} />
      <ChatMessages messages={messages} loading={loading} />
      <ChatInput onSend={onSend} loading={loading} />
    </div>
  );
}