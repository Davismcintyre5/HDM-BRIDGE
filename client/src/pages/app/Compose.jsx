import { useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import { emailsAPI } from '@api/emails';
import { useApp } from '@context/AppContext';

export default function Compose() {
  const { showToast } = useApp();
  const [form, setForm] = useState({ from: '', fromName: '', to: '', subject: '', htmlBody: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailsAPI.compose(form);
      showToast('Email sent!', 'success');
      setForm({ from: '', fromName: '', to: '', subject: '', htmlBody: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send', 'error');
    }
    setLoading(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <PageHeader title="Compose" description="Send a new email" />
      <div className="card max-w-3xl">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Email</label>
              <input type="email" name="from" className="input" value={form.from} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">From Name</label>
              <input type="text" name="fromName" className="input" value={form.fromName} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label">To</label>
            <input type="email" name="to" className="input" value={form.to} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Subject</label>
            <input type="text" name="subject" className="input" value={form.subject} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">HTML Body</label>
            <textarea name="htmlBody" className="input font-mono text-sm" rows={10} value={form.htmlBody} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </form>
      </div>
    </>
  );
}