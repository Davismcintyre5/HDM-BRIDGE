import { useState } from 'react';
import ChatToggleButton from '../app/features/Chat/ChatToggleButton';
import ChatPanel from '../app/features/Chat/ChatPanel';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const sendMessage = async (msg) => {
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/landing/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <ChatToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && <ChatPanel messages={messages} loading={loading} onSend={sendMessage} onClose={() => setIsOpen(false)} onClear={() => setMessages([])} />}
    </>
  );
}