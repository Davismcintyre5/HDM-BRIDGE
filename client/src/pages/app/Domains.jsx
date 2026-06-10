import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import StatusBadge from '@components/app/ui/StatusBadge';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import Modal from '@components/app/ui/Modal';
import CopyButton from '@components/app/ui/CopyButton';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import { FiGlobe, FiPlus, FiRefreshCw } from 'react-icons/fi';

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState(null);
  const [showDns, setShowDns] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => { fetchDomains(); }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/domains`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDomains(data.domains || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newDomain) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: newDomain }),
      });
      const data = await res.json();
      if (data.success) {
        setDomains([...domains, data.domain]);
        setDnsRecords(data.dnsRecommendations);
        setShowDns(data.domain._id);
        setShowAdd(false);
        setNewDomain('');
      } else {
        setError(data.error || 'Failed to add domain');
      }
    } catch {
      setError('Failed to add domain');
    }
  };

  const handleVerify = async (id) => {
    setVerifying(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/domains/${id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDomains(domains.map(d => d._id === id ? data.domain : d));
        if (!data.verified) {
          setDnsRecords(data.verification.recommendations);
          setShowDns(id);
        }
      }
    } catch {}
    setVerifying(null);
  };

  const handleViewDns = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/domains/${id}/dns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDnsRecords(data.recommendations);
        setShowDns(id);
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/domains/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDomains(domains.filter(d => d._id !== deleteId));
    } catch {}
    setDeleteId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="Domains" description="Manage your sending domains" action={
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Add Domain</button>
      } />

      {domains.length === 0 ? (
        <EmptyState icon={FiGlobe} title="No domains" description="Add a domain to start sending emails" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">Add Domain</button>
        } />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Domain</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">SPF</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">DKIM</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">DMARC</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.domain}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.isVerified ? 'verified' : 'pending'} /></td>
                  <td className="px-4 py-3">{d.dnsRecords?.spf?.verified ? '✅' : '❌'}</td>
                  <td className="px-4 py-3">{d.dnsRecords?.dkim?.verified ? '✅' : '❌'}</td>
                  <td className="px-4 py-3">{d.dnsRecords?.dmarc?.exists ? '✅' : '⚠️'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleViewDns(d._id)} className="text-xs text-indigo-600 hover:text-indigo-800">DNS</button>
                    {!d.isVerified && (
                      <button onClick={() => handleVerify(d._id)} disabled={verifying === d._id} className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">
                        <FiRefreshCw size={14} className={verifying === d._id ? 'animate-spin' : ''} /> Verify
                      </button>
                    )}
                    <button onClick={() => setDeleteId(d._id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Domain Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Domain" size="sm">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="label">Domain Name</label>
            <input type="text" className="input" placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
          </div>
          <button onClick={handleAdd} className="btn-primary w-full">Add Domain</button>
        </div>
      </Modal>

      {/* DNS Records Modal */}
      <Modal isOpen={!!showDns} onClose={() => setShowDns(null)} title="DNS Records" size="lg">
        <p className="text-sm text-gray-500 mb-4">Add these records to your domain's DNS settings.</p>
        <div className="space-y-4">
          {dnsRecords?.map((rec, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">{rec.type} Record</span>
                <CopyButton text={rec.value} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Host:</span> <code className="text-gray-900">{rec.host}</code></div>
                <div><span className="text-gray-500">Value:</span> <code className="text-gray-900 break-all">{rec.value}</code></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{rec.reason}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">After adding records, click <strong>Verify</strong> to check.</p>
        <button onClick={() => setShowDns(null)} className="btn-primary w-full mt-4">Done</button>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Domain"
        message="This domain will be removed. Emails from this domain will no longer be sent."
        confirmText="Delete"
        danger
      />
    </>
  );
}