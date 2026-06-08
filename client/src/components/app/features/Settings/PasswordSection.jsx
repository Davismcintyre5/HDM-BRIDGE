import { useState } from 'react';
import { authAPI } from '@api/auth';
import { useApp } from '@context/AppContext';

export default function PasswordSection() {
  const { showToast } = useApp();
  const [form, setForm] = useState({ current: '', newPass: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await authAPI.changePassword(form.current, form.newPass); showToast('Password updated', 'success'); setForm({ current: '', newPass: '' }); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div><label className="label">Current Password</label><input type="password" className="input" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required /></div>
        <div><label className="label">New Password</label><input type="password" className="input" value={form.newPass} onChange={(e) => setForm({ ...form, newPass: e.target.value })} required /></div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}