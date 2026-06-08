import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';

export default function ActivityItem({ activity }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.subject || 'No Subject'}</p>
        <p className="text-xs text-gray-500 truncate">{activity.to?.email}</p>
      </div>
      <div className="flex items-center space-x-3">
        <StatusBadge status={activity.status} />
        <span className="text-xs text-gray-400">{formatDate(activity.createdAt)}</span>
      </div>
    </div>
  );
}