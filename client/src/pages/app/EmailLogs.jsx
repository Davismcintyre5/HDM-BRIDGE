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
import { FiList } from 'react-icons/fi';

export default function EmailLogs() {
  const { logs, total, loading, fetchLogs } = useLogs();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => { fetchLogs({ page, search }); }, [page, search]);

  return (
    <>
      <PageHeader title="Email Logs" description="Track your sent emails" />
      <FilterBar>
        <SearchFilter value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by email or subject..." />
      </FilterBar>
      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <EmptyState icon={FiList} title="No logs" description="Send your first email to see it here" />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
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
      <LogDetailModal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} log={selectedLog} />
    </>
  );
}