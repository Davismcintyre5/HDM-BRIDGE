import { useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import { useApp } from '@context/AppContext';

export default function Compose() {
  const { showToast } = useApp();
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState({
    from: '', fromName: '', to: '', subject: '', htmlBody: '', textBody: '',
    bulkTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSend = async (e) => {
    e.preventDefault();

    if (mode === 'single') {
      if (!form.to || !form.subject || !form.htmlBody) {
        showToast('To, Subject, and HTML Body are required', 'error');
        return;
      }
      await sendSingle();
    } else {
      if (!form.bulkTo || !form.subject || !form.htmlBody) {
        showToast('Recipients, Subject, and HTML Body are required', 'error');
        return;
      }
      await sendBulk();
    }
  };

  const buildPayload = (recipient) => ({
    from: form.from || undefined,
    fromName: form.fromName || undefined,
    to: recipient,
    subject: form.subject,
    htmlBody: form.htmlBody,
    textBody: form.textBody || undefined,
  });

  const sendSingle = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/emails/compose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload(form.to.trim())),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Email sent successfully!', 'success');
        setForm({ ...form, to: '', subject: '', htmlBody: '', textBody: '' });
      } else {
        showToast(data.error || 'Failed to send', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
    setLoading(false);
  };

  const sendBulk = async () => {
    const recipients = form.bulkTo
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    if (recipients.length === 0) {
      showToast('No valid email addresses found', 'error');
      return;
    }

    if (recipients.length > 50) {
      showToast('Maximum 50 recipients per batch', 'error');
      return;
    }

    setLoading(true);
    setResults(null);

    const token = localStorage.getItem('token');
    let sent = 0;
    let failed = 0;
    const details = [];

    for (const recipient of recipients) {
      try {
        const res = await fetch(`${API_URL}/emails/compose`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildPayload(recipient)),
        });

        const data = await res.json();

        if (data.success) {
          sent++;
          details.push({ email: recipient, status: 'sent', messageId: data.messageId });
        } else {
          failed++;
          details.push({ email: recipient, status: 'failed', error: data.error });
        }
      } catch {
        failed++;
        details.push({ email: recipient, status: 'failed', error: 'Network error' });
      }
    }

    setResults({ sent, failed, total: recipients.length, details });
    setLoading(false);

    if (failed === 0) {
      showToast(`All ${sent} emails sent!`, 'success');
      setForm({ ...form, bulkTo: '', subject: '', htmlBody: '', textBody: '' });
    } else {
      showToast(`${sent} sent, ${failed} failed`, 'error');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <PageHeader title="Compose" description="Send emails to your recipients" />

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Single Recipient
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'bulk' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Bulk Send
        </button>
      </div>

      <div className="card max-w-3xl">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Email (optional)</label>
              <input type="email" name="from" className="input" value={form.from} onChange={handleChange} placeholder="you@yourdomain.com" />
            </div>
            <div>
              <label className="label">From Name (optional)</label>
              <input type="text" name="fromName" className="input" value={form.fromName} onChange={handleChange} placeholder="Your App Name" />
            </div>
          </div>

          {mode === 'single' ? (
            <div>
              <label className="label">To *</label>
              <input type="email" name="to" className="input" value={form.to} onChange={handleChange} placeholder="recipient@example.com" required />
            </div>
          ) : (
            <div>
              <label className="label">Recipients * (one per line or comma-separated, max 50)</label>
              <textarea
                name="bulkTo"
                className="input text-sm"
                rows={5}
                value={form.bulkTo}
                onChange={handleChange}
                placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                required
              />
              {form.bulkTo && (
                <p className="text-xs text-gray-500 mt-1">
                  {form.bulkTo.split(/[\n,]+/).filter(e => e.includes('@')).length} valid recipients
                </p>
              )}
            </div>
          )}

          <div>
            <label className="label">Subject *</label>
            <input type="text" name="subject" className="input" value={form.subject} onChange={handleChange} placeholder="Email subject" required />
          </div>

          <div>
            <label className="label">HTML Body *</label>
            <textarea name="htmlBody" className="input font-mono text-sm" rows={10} value={form.htmlBody} onChange={handleChange} placeholder="<h1>Hello</h1><p>Your message here</p>" required />
          </div>

          <div>
            <label className="label">Text Body (optional)</label>
            <textarea name="textBody" className="input text-sm" rows={3} value={form.textBody} onChange={handleChange} placeholder="Plain text version" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Sending...' : mode === 'single' ? 'Send Email' : `Send to ${form.bulkTo?.split(/[\n,]+/).filter(e => e.includes('@')).length || 0} Recipients`}
          </button>
        </form>

        {results && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Results: {results.sent} sent, {results.failed} failed (Total: {results.total})
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {results.details.map((d, i) => (
                <div key={i} className={`text-sm px-3 py-2 rounded-lg flex items-center justify-between ${
                  d.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <span>{d.email}</span>
                  <span>{d.status === 'sent' ? '✅' : `❌ ${d.error}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}