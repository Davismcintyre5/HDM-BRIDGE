import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export default function ChatInput({ onSend, loading }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-3 flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 input text-sm py-2"
      />
      <button onClick={handleSend} disabled={loading || !message.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        <FiSend size={16} />
      </button>
    </div>
  );
}