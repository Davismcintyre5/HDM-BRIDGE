import { useState } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const sendMessage = async (message, isAuthenticated = false) => {
    setMessages([...messages, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const endpoint = isAuthenticated ? `${API_URL}/chat/send` : `${API_URL}/landing/chat`;
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) {
        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }
      const body = isAuthenticated 
        ? JSON.stringify({ message }) 
        : JSON.stringify({ message });

      const res = await fetch(endpoint, { method: 'POST', headers, body });
      const data = await res.json();
      const reply = data.reply || data.message || 'Sorry, something went wrong.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return { messages, loading, sendMessage, clearChat };
};