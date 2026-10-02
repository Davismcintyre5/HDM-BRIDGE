import { useEffect, useState } from 'react';
import StatusBadge from '@components/app/ui/StatusBadge';
import { formatDate } from '@utils/helpers';
import { formatMoney } from '@utils/currency';
import { currencyAPI } from '@api/currency';

export default function TransactionRow({ transaction }) {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    currencyAPI.getSupported()
      .then(({ data }) => setCurrencies(data.currencies || []))
      .catch(() => {});
  }, []);

  return (
    <tr className="border-b border-gray-50">
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(transaction.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {formatMoney(transaction.amount, transaction.currency, currencies)}
      </td>
      <td className="px-4 py-3"><StatusBadge status={transaction.status} /></td>
    </tr>
  );
}