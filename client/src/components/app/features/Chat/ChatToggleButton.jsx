import { FiMessageSquare, FiX } from 'react-icons/fi';

export default function ChatToggleButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50 flex items-center justify-center"
    >
      {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
    </button>
  );
}