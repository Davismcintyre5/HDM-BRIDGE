import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { authAPI } from '@api/auth';
import { useApp } from '@context/AppContext';

export default function ProfileSection() {
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const { data } = await authAPI.updateProfile(form); updateUser(data.user); showToast('Profile updated', 'success'); } catch { showToast('Failed', 'error'); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input type="text" className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
          <div><label className="label">Last Name</label><input type="text" className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        </div>
        <div><label className="label">Phone</label><input type="text" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
}