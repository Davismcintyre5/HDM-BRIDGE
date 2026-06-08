import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';

export default function EmailInfo({ log }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div><span className="text-gray-500">From:</span> <span className="text-gray-900">{log.from?.email}</span></div>
      <div><span className="text-gray-500">To:</span> <span className="text-gray-900">{log.to?.email}</span></div>
      <div><span className="text-gray-500">Subject:</span> <span className="text-gray-900">{log.subject}</span></div>
      <div><span className="text-gray-500">Status:</span> <StatusBadge status={log.status} /></div>
      <div><span className="text-gray-500">Message ID:</span> <code className="text-xs text-gray-700">{log.messageId}</code></div>
      <div><span className="text-gray-500">Date:</span> <span className="text-gray-900">{formatDate(log.createdAt)}</span></div>
    </div>
  );
}