import { FiX, FiTrash2 } from 'react-icons/fi';

export default function ChatHeader({ onClose, onClear }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-indigo-600 rounded-t-xl">
      <div>
        <h3 className="text-white font-semibold text-sm">HDM Support</h3>
        <p className="text-indigo-200 text-xs">Ask me anything!</p>
      </div>
      <div className="flex items-center space-x-1">
        <button onClick={onClear} className="p-1.5 text-indigo-200 hover:text-white rounded"><FiTrash2 size={16} /></button>
        <button onClick={onClose} className="p-1.5 text-indigo-200 hover:text-white rounded"><FiX size={18} /></button>
      </div>
    </div>
  );
}