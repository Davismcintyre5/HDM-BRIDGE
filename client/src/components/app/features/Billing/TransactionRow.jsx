import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';

export default function TransactionRow({ transaction }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">${transaction.amount?.toFixed(2)}</td>
      <td className="px-4 py-3"><StatusBadge status={transaction.status} /></td>
    </tr>
  );
}