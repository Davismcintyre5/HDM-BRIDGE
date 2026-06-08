import { useState } from 'react';
import { emailsAPI } from '@api/emails';
import { useApp } from '@context/AppContext';

export default function QuickSend() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailsAPI.send({ to, subject, htmlBody: message, fromName: 'HDM Test' });
      showToast('Email sent!', 'success');
      setTo(''); setSubject(''); setMessage('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Send</h3>
      <form onSubmit={handleSend} className="space-y-3">
        <input type="email" className="input" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} required />
        <input type="text" className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <textarea className="input" rows={3} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Test'}</button>
      </form>
    </div>
  );
}