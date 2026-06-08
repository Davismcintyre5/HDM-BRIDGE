export default function ChatBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
        isUser ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
      }`}>
        {content}
      </div>
    </div>
  );
}