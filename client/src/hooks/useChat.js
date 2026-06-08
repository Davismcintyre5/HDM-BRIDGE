import { useState } from 'react';
import { chatAPI } from '../api/chat';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    setMessages([...messages, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const { data } = await chatAPI.send(message, sessionId);
      if (!sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  return { messages, loading, sendMessage, clearChat };
};