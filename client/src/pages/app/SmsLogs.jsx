import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import Card from '@components/app/ui/Card';
import StatusBadge from '@components/app/ui/StatusBadge';
import Pagination from '@components/app/ui/Pagination';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import Modal from '@components/app/ui/Modal';
import { smsAPI } from '@api/sms';
import { formatCurrency, formatDate } from '@utils/helpers';
import { FiMessageSquare } from 'react-icons/fi';

const STATUS_FILTERS = [
  { value: '', label: 'Any status' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'queued', label: 'Queued' },
  { value: 'failed', label: 'Failed' },
];

const TYPE_FILTERS = [
  { value: '', label: 'All types' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
];

export default function SmsLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await smsAPI.getLogs({
          page,
          status: status || undefined,
          type: type || undefined,
        });
        setLogs(res?.data?.data || []);
        setTotal(res?.data?.pagination?.total || 0);
      } catch {}
      setLoading(false);
    };
    load();
  }, [page, status, type]);

  const resetTo = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="SMS Logs" description="Every SMS sent by your organization" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={status} onChange={(e) => resetTo(setStatus, e.target.value)} className="input text-sm max-w-xs">
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={type} onChange={(e) => resetTo(setType, e.target.value)} className="input text-sm max-w-xs">
          {TYPE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState icon={FiMessageSquare} title="No SMS logs" description="SMS sent from your dashboard or API will appear here" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sender</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(log)}>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{log.to}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.content}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{log.senderId || '(default)'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(log.costKes || 0, 'KES')}</td>
                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} onChange={setPage} />
        </Card>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="SMS Details" size="md">
        {selected && (
          <div className="space-y-3 text-sm">
            <Row label="To" value={<span className="font-mono">{selected.to}</span>} />
            <Row label="Sender" value={selected.senderId || '(AT default)'} />
            <Row label="Status" value={<StatusBadge status={selected.status} />} />
            <Row label="AT status code" value={selected.statusCode ?? '—'} />
            <Row label="Cost" value={formatCurrency(selected.costKes || 0, 'KES')} />
            <Row label="Units" value={selected.units || 1} />
            <Row label="Type" value={selected.type} />
            <Row label="Sent" value={formatDate(selected.createdAt)} />
            {selected.errorCode && <Row label="Error code" value={selected.errorCode} />}
            {selected.errorMessage && <Row label="Error message" value={selected.errorMessage} />}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Message</p>
              <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-800 whitespace-pre-wrap break-words">{selected.content}</pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-900 text-xs text-right">{value}</span>
    </div>
  );
}