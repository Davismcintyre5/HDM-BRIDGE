import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import StatusBadge from '@components/app/ui/StatusBadge';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import Modal from '@components/app/ui/Modal';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import { FiMail, FiPlus, FiCheck, FiStar } from 'react-icons/fi';

export default function Senders() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSteps, setShowSteps] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => { fetchSenders(); }, []);

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/senders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSenders(data.senders || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/senders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSenders([...senders, data.sender]);
        setShowSteps(data.verificationSteps);
        setShowAdd(false);
        setForm({ name: '', email: '' });
      } else {
        setError(data.error || 'Failed to add sender');
      }
    } catch {
      setError('Failed to add sender');
    }
  };

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/senders/${id}/verify`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSenders(senders.map(s => s._id === id ? data.sender : s));
      }
    } catch {}
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/senders/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSenders(senders.map(s => ({ ...s, isDefault: s._id === id })));
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/senders/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSenders(senders.filter(s => s._id !== deleteId));
    } catch {}
    setDeleteId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <PageHeader title="Senders" description="Manage verified sender emails" action={
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Add Sender</button>
      } />

      {senders.length === 0 ? (
        <EmptyState icon={FiMail} title="No senders" description="Add a sender email to start sending" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">Add Sender</button>
        } />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Default</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((s) => (
                <tr key={s._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.isVerified ? 'verified' : 'pending'} /></td>
                  <td className="px-4 py-3">
                    {s.isDefault ? (
                      <span className="text-yellow-500"><FiStar size={16} /></span>
                    ) : s.isVerified ? (
                      <button onClick={() => handleSetDefault(s._id)} className="text-xs text-gray-400 hover:text-yellow-500">Set Default</button>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {!s.isVerified && (
                      <button onClick={() => handleVerify(s._id)} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <FiCheck size={14} /> I've Verified
                      </button>
                    )}
                    <button onClick={() => setDeleteId(s._id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Sender Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Sender" size="sm">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Sender Name</label>
            <input type="text" className="input" placeholder="My App" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="notifications@mydomain.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary w-full">Add Sender</button>
        </form>
      </Modal>

      {/* Verification Steps Modal */}
      <Modal isOpen={!!showSteps} onClose={() => setShowSteps(null)} title="Verify Your Sender" size="md">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-3">Follow these steps to verify your sender:</p>
            <ol className="space-y-2">
              {showSteps?.map((step, i) => (
                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="font-semibold">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-gray-500 text-center">
            After verifying in Brevo, click <strong>"I've Verified"</strong> next to your sender in the list.
          </p>
          <button onClick={() => setShowSteps(null)} className="btn-primary w-full">Got it</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Sender"
        message="This sender will be removed. You won't be able to send from this address."
        confirmText="Delete"
        danger
      />
    </>
  );
}