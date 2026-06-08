import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
      <div className="flex items-center space-x-2">
        <FiAlertCircle size={18} className="text-red-500" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600">×</button>
      )}
    </div>
  );
}