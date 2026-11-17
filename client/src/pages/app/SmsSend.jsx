import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import Card from '@components/app/ui/Card';
import Button from '@components/app/ui/Button';
import Input from '@components/app/ui/Input';
import { useApp } from '@context/AppContext';
import { smsAPI } from '@api/sms';
import { sendersAPI } from '@api/senders';
import { formatCurrency } from '@utils/helpers';
import { FiSend, FiSmartphone, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SmsSend() {
  const { showToast } = useApp();

  const [wallet, setWallet] = useState(null);
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    to: '',
    content: '',
    sender: '',
    type: 'transactional',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [w, s] = await Promise.all([
          smsAPI.getWallet().catch(() => null),
          sendersAPI.getAll().catch(() => null),
        ]);
        if (w?.data?.wallet) setWallet(w.data.wallet);
        const all = s?.data?.senders || [];
        const smsApproved = all.filter(
          (x) =>
            Array.isArray(x.channels) &&
            x.channels.includes('sms') &&
            x.reviewStatus === 'approved' &&
            x.atRegistered
        );
        setSenders(smsApproved);
      } catch {
        showToast('Failed to load SMS data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rateKes = 1.0;
  const units = form.content.length > 0 ? Math.max(1, Math.ceil(form.content.length / 160)) : 0;
  const costKes = units * rateKes;
  const canAfford = wallet && wallet.balance >= costKes;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.to.trim() || !form.content.trim()) {
      showToast('Recipient and message are required', 'error');
      return;
    }
    if (!canAfford) {
      showToast('Insufficient SMS balance. Top up first.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await smsAPI.send({
        to: form.to.trim(),
        content: form.content.trim(),
        sender: form.sender || undefined,
        type: form.type,
      });
      const data = res?.data;
      if (data?.success) {
        showToast('SMS sent successfully!', 'success');
        setForm({ ...form, to: '', content: '' });
        const w = await smsAPI.getWallet().catch(() => null);
        if (w?.data?.wallet) setWallet(w.data.wallet);
      } else {
        showToast(data?.error || 'SMS send failed', 'error');
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.error || 'SMS send failed';
      if (code === 'SMS_INSUFFICIENT_BALANCE') {
        showToast('Insufficient SMS balance. Top up first.', 'error');
      } else if (code === 'SMS_DISABLED') {
        showToast('SMS service is currently disabled', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Send SMS"
        description="Send transactional SMS to your recipients"
      />

      {wallet && (
        <Card className="mb-6 bg-indigo-50 border-indigo-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FiSmartphone className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-xs text-indigo-700 uppercase tracking-wide">SMS Wallet</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {formatCurrency(wallet.balance, wallet.currency || 'KES')}
                </p>
              </div>
            </div>
            <Link to="/sms/wallet" className="btn-primary btn-sm">
              Top Up
            </Link>
          </div>
        </Card>
      )}

      <Card className="max-w-3xl">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient phone *"
              placeholder="+254712345678"
              hint="E.164 format — start with country code"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
              <select
                className="input"
                value={form.sender}
                onChange={(e) => setForm({ ...form, sender: e.target.value })}
              >
                <option value="">Default sender</option>
                {senders.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name} — {s.email}
                  </option>
                ))}
              </select>
              {senders.length === 0 && (
                <p className="text-xs text-yellow-700 mt-1">
                  No SMS senders approved yet. <Link to="/senders" className="underline">Add one</Link>.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              className="input text-sm"
              rows={5}
              placeholder="Your verification code is 1234"
              maxLength={1600}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-gray-500">
                {form.content.length}/1600 chars • {units} SMS part{units === 1 ? '' : 's'}
              </span>
              <span className="text-gray-500">
                Cost: {formatCurrency(costKes, 'KES')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-2">
              {[
                { value: 'transactional', label: 'Transactional' },
                { value: 'marketing', label: 'Marketing' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.type === t.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {!canAfford && costKes > 0 && (
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Insufficient balance</p>
                <p className="text-xs mt-0.5">
                  Need {formatCurrency(costKes, 'KES')}, have {formatCurrency(wallet?.balance || 0, 'KES')}.{' '}
                  <Link to="/sms/wallet" className="underline font-medium">Top up →</Link>
                </p>
              </div>
            </div>
          )}

          <Button type="submit" loading={sending} disabled={!canAfford || !form.to || !form.content} className="w-full py-3">
            <FiSend className="w-4 h-4 mr-2" />
            Send SMS {costKes > 0 && `— ${formatCurrency(costKes, 'KES')}`}
          </Button>
        </form>
      </Card>
    </>
  );
}