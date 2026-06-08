import { useState } from 'react';
import ChatToggleButton from './ChatToggleButton';
import ChatPanel from './ChatPanel';
import { useChat } from '@hooks/useChat';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, sendMessage, clearChat } = useChat();

  return (
    <>
      <ChatToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && <ChatPanel messages={messages} loading={loading} onSend={(msg) => sendMessage(msg, true)} onClose={() => setIsOpen(false)} onClear={clearChat} />}
    </>
  );
}