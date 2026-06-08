import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';

export default function LogRow({ log, onClick }) {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onClick(log)}>
      <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-[200px]">{log.to?.email}</td>
      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{log.subject}</td>
      <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.createdAt)}</td>
    </tr>
  );
}