import { useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import StatusBadge from '../../components/app/ui/StatusBadge';
import EmptyState from '../../components/app/ui/EmptyState';
import { FiMail, FiPlus } from 'react-icons/fi';

export default function Senders() {
  const [senders, setSenders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  return (
    <>
      <PageHeader title="Senders" description="Manage verified sender emails" action={
        <button onClick={() => setShowAdd(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Add Sender</button>
      } />
      {senders.length === 0 ? (
        <EmptyState icon={FiMail} title="No senders" description="Add a sender email to start sending" />
      ) : (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((s) => (
                <tr key={s._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.isVerified ? 'verified' : 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAdd && (
        <div className="card max-w-md mt-4">
          <h3 className="font-semibold mb-3">Add Sender</h3>
          <input type="text" className="input mb-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" className="input mb-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button className="btn-primary w-full">Add Sender</button>
        </div>
      )}
    </>
  );
}