import { useState } from 'react';
import ChatToggleButton from '../app/features/Chat/ChatToggleButton';
import ChatPanel from '../app/features/Chat/ChatPanel';
import { useChat } from '../../hooks/useChat';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, sendMessage, clearChat } = useChat();

  return (
    <>
      <ChatToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
          onClear={clearChat}
        />
      )}
    </>
  );
}