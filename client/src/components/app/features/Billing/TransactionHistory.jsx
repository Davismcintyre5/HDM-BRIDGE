import { useEffect, useState } from 'react';
import TransactionRow from './TransactionRow';
import EmptyState from '@components/app/ui/EmptyState';
import { FiDollarSign } from 'react-icons/fi';
import { currencyAPI } from '@api/currency';

export default function TransactionHistory({ transactions }) {
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    currencyAPI.getSupported()
      .then(({ data }) => setCurrencies(data.currencies || []))
      .catch(() => {});
  }, []);

  if (!transactions || transactions.length === 0) {
    return <EmptyState icon={FiDollarSign} title="No transactions" description="Your payment history will appear here" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <TransactionRow key={t._id} transaction={t} currencies={currencies} />
          ))}
        </tbody>
      </table>
    </div>
  );
}