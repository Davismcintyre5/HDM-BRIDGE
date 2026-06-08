import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Copy">
      {copied ? <FiCheck size={16} className="text-green-500" /> : <FiCopy size={16} className="text-gray-400" />}
    </button>
  );
}