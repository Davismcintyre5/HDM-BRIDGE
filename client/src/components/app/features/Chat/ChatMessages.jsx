import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import LoadingSpinner from '../../ui/LoadingSpinner';

export default function ChatMessages({ messages, loading }) {
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">Ask me anything about HDM BRIDGE!</p>
      )}
      {messages.map((msg, i) => (
        <ChatBubble key={i} role={msg.role} content={msg.content} />
      ))}
      {loading && <div className="flex justify-start"><LoadingSpinner size="sm" /></div>}
      <div ref={bottomRef} />
    </div>
  );
}