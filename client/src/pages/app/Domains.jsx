import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import StatusBadge from '../../components/app/ui/StatusBadge';
import EmptyState from '../../components/app/ui/EmptyState';
import LoadingSpinner from '../../components/app/ui/LoadingSpinner';
import DNSRecordsModal from '../../components/app/features/Domains/DNSRecordsModal';
import ConfirmDialog from '../../components/app/ui/ConfirmDialog';
import { domainsAPI } from '../../api/domains';
import { FiGlobe, FiPlus } from 'react-icons/fi';

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchDomains(); }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const { data } = await domainsAPI.getAll();
      setDomains(data.domains || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newDomain) return;
    try {
      const { data } = await domainsAPI.add(newDomain);
      setDnsRecords(data.dnsRecommendations);
      fetchDomains();
      setShowAdd(false);
      setNewDomain('');
    } catch {}
  };

  const handleVerify = async (id) => {
    try {
      const { data } = await domainsAPI.verify(id);
      setDomains(domains.map(d => d._id === id ? data.domain : d));
    } catch {}
  };

  const handleDelete = async () => {
    if (deleteId) {
      await domainsAPI.delete(deleteId);
      setDomains(domains.filter(d => d._id !== deleteId));
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="Domains" description="Manage your sending domains" action={
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Add Domain</button>
      } />
      {domains.length === 0 ? (
        <EmptyState icon={FiGlobe} title="No domains" description="Add a domain to start sending emails" />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Domain</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.domain}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.isVerified ? 'verified' : 'pending'} /></td>
                  <td className="px-4 py-3 space-x-2">
                    {!d.isVerified && <button onClick={() => handleVerify(d._id)} className="text-xs text-indigo-600 hover:text-indigo-800">Verify</button>}
                    <button onClick={() => setDeleteId(d._id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <div className="card max-w-md mt-4">
          <h3 className="font-semibold mb-3">Add Domain</h3>
          <input type="text" className="input mb-3" placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
          <button onClick={handleAdd} className="btn-primary w-full">Add Domain</button>
        </div>
      )}
      <DNSRecordsModal isOpen={!!dnsRecords} onClose={() => setDnsRecords(null)} records={dnsRecords} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Domain" message="This domain will be removed. Emails from this domain will no longer be sent." confirmText="Delete" danger />
    </>
  );
}