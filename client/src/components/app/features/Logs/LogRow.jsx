import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';

const SOURCE_STYLES = {
  api: { label: 'API', className: 'bg-blue-100 text-blue-700' },
  dashboard: { label: 'Dashboard', className: 'bg-indigo-100 text-indigo-700' },
  system: { label: 'System', className: 'bg-purple-100 text-purple-700' },
  broadcast: { label: 'Broadcast', className: 'bg-pink-100 text-pink-700' },
};

function SenderBadge({ log }) {
  if (log.source === 'api' && log.apiKeyName) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        {log.apiKeyName}
      </span>
    );
  }

  const s = SOURCE_STYLES[log.source] || SOURCE_STYLES.api;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function LogRow({ log, onClick }) {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onClick(log)}>
      <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[200px]">
        {log.to?.email || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">
        {log.subject || '—'}
      </td>
      <td className="px-4 py-3">
        <SenderBadge log={log} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={log.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {formatDate(log.createdAt)}
      </td>
    </tr>
  );
}