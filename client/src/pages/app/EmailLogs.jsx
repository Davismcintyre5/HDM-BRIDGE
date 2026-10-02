import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import SearchFilter from '../../components/app/ui/SearchFilter';
import FilterBar from '../../components/app/ui/FilterBar';
import Pagination from '../../components/app/ui/Pagination';
import EmptyState from '../../components/app/ui/EmptyState';
import LoadingSpinner from '../../components/app/ui/LoadingSpinner';
import LogRow from '../../components/app/features/Logs/LogRow';
import LogDetailModal from '../../components/app/features/Logs/LogDetailModal';
import { useLogs } from '../../hooks/useLogs';
import { FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SOURCE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'api', label: 'API' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'system', label: 'System' },
  { value: 'broadcast', label: 'Broadcast' },
];

const STATUS_FILTERS = [
  { value: '', label: 'Any status' },
  { value: 'queued', label: 'Queued' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'failed', label: 'Failed' },
  { value: 'bounced', label: 'Bounced' },
];

export default function EmailLogs() {
  const { logs, total, loading, fetchLogs } = useLogs();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs({
      page,
      search,
      source: source || undefined,
      status: status || undefined,
      sort: sortDesc ? '-createdAt' : 'createdAt',
    });
  }, [page, search, source, status, sortDesc]);

  const resetTo = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Email Logs" description="Every email sent by your organization" />

      <FilterBar>
        <SearchFilter
          value={search}
          onChange={(v) => resetTo(setSearch, v)}
          placeholder="Search by email, subject, or sender..."
        />

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => resetTo(setSource, f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                source === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={status}
          onChange={(e) => resetTo(setStatus, e.target.value)}
          className="input text-sm"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </FilterBar>

      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FiList}
          title="No logs"
          description="Emails sent by any project or by the platform will appear here"
        />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sender</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={() => { setSortDesc(!sortDesc); setPage(1); }}
                    className="inline-flex items-center gap-1 hover:text-gray-700"
                  >
                    Date
                    {sortDesc ? <FiChevronDown className="w-3 h-3" /> : <FiChevronUp className="w-3 h-3" />}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <LogRow key={log._id} log={log} onClick={setSelectedLog} />
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} onChange={setPage} />
        </div>
      )}

      <LogDetailModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </>
  );
}