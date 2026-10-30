import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import StatusBadge from '@components/app/ui/StatusBadge';
import EmptyState from '@components/app/ui/EmptyState';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import Modal from '@components/app/ui/Modal';
import ConfirmDialog from '@components/app/ui/ConfirmDialog';
import CopyButton from '@components/app/ui/CopyButton';
import { FiMail, FiPlus, FiStar } from 'react-icons/fi';
import { sendersAPI } from '@api/senders';

export default function Senders() {
  const [senders, setSenders] = useState([]);
  const [platformSenders, setPlatformSenders] = useState([]);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSubmitted, setShowSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchSenders = async () => {
    setLoading(true);
    try {
      const res = await sendersAPI.getAll();
      setSenders(res?.data?.senders || []);
    } catch {}
    setLoading(false);
  };

  const fetchPlatformSenders = async () => {
    setPlatformLoading(true);
    try {
      const res = await sendersAPI.getPlatform();
      setPlatformSenders(res?.data?.senders || []);
    } catch {}
    setPlatformLoading(false);
  };

  useEffect(() => {
    fetchSenders();
    fetchPlatformSenders();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await sendersAPI.add(form);
      const data = res?.data;
      if (data?.success) {
        setSenders([data.sender, ...senders]);
        setShowAdd(false);
        setShowSubmitted(true);
        setForm({ name: '', email: '' });
      } else {
        setError(data?.error || 'Failed to add sender');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add sender');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await sendersAPI.setDefault(id);
      if (res?.data?.success) {
        setSenders(senders.map((s) => ({ ...s, isDefault: s._id === id })));
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await sendersAPI.delete(deleteId);
      setSenders(senders.filter((s) => s._id !== deleteId));
    } catch {}
    setDeleteId(null);
  };

  const statusFor = (s) => {
    if (s.reviewStatus === 'rejected') return 'rejected';
    if (s.reviewStatus === 'approved' || s.isVerified) return 'verified';
    return 'pending';
  };

  return (
    <>
      <PageHeader
        title="Senders"
        description="Manage verified sender emails"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">
            <FiPlus size={16} className="mr-1" /> Add Sender
          </button>
        }
      />

      <div className="card mb-6 bg-indigo-50 border-indigo-200">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Platform senders</h3>
            <p className="text-xs text-indigo-700 mt-1">
              Verified addresses you can use right now in your API "from" field — no domain setup needed.
            </p>
          </div>
        </div>

        {platformLoading ? (
          <p className="text-xs text-indigo-700">Loading…</p>
        ) : platformSenders.length === 0 ? (
          <p className="text-xs text-indigo-700">
            No platform senders available yet. Use your own verified sender below.
          </p>
        ) : (
          <div className="space-y-2">
            {platformSenders.map((s) => (
              <div key={s._id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    {s.isDefault && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate">{s.email}</p>
                  {s.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                  )}
                </div>
                <CopyButton text={s.email} />
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : senders.length === 0 ? (
        <EmptyState
          icon={FiMail}
          title="No senders yet"
          description="Add your own sender email, or use a platform sender above"
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm">
              Add Sender
            </button>
          }
        />
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
              {senders.map((s) => {
                const status = statusFor(s);
                const approved = status === 'verified';
                return (
                  <tr key={s._id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                      {status === 'rejected' && s.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {s.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.isDefault ? (
                        <span className="text-yellow-500"><FiStar size={16} /></span>
                      ) : approved ? (
                        <button
                          onClick={() => handleSetDefault(s._id)}
                          className="text-xs text-gray-400 hover:text-yellow-500"
                        >
                          Set Default
                        </button>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(s._id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Sender" size="sm">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text"
              className="input"
              placeholder="My App"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="notifications@mydomain.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">Submit for Review</button>
        </form>
      </Modal>

      <Modal isOpen={showSubmitted} onClose={() => setShowSubmitted(false)} title="Submitted for Review" size="md">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              Your sender has been submitted. Our team will review it and enable it for your account once approved.
              You'll be notified by email.
            </p>
          </div>
          <button onClick={() => setShowSubmitted(false)} className="btn-primary w-full">Got it</button>
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