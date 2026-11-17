import { useEffect, useState, useCallback, useRef } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import Card from '@components/app/ui/Card';
import Button from '@components/app/ui/Button';
import Input from '@components/app/ui/Input';
import Modal from '@components/app/ui/Modal';
import LoadingSpinner from '@components/app/ui/LoadingSpinner';
import EmptyState from '@components/app/ui/EmptyState';
import StatusBadge from '@components/app/ui/StatusBadge';
import { useApp } from '@context/AppContext';
import { smsAPI } from '@api/sms';
import { formatCurrency, formatDate } from '@utils/helpers';
import { FiSmartphone, FiPlus, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 5 * 60 * 1000;

export default function SmsWallet() {
  const { showToast } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);

  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [topupState, setTopupState] = useState('idle');
  const [topupMsg, setTopupMsg] = useState('');
  const [transactionId, setTransactionId] = useState(null);

  const pollTimerRef = useRef(null);
  const timeoutRef = useRef(null);
  const startedAtRef = useRef(null);
  const userClosedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollTimerRef.current = null;
    timeoutRef.current = null;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await smsAPI.getWallet();
      setData(res?.data || null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load wallet', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!showTopup) {
      stopPolling();
      setAmount('');
      setPhone('');
      setTopupState('idle');
      setTopupMsg('');
      setTransactionId(null);
      startedAtRef.current = null;
      userClosedRef.current = false;
    }
  }, [showTopup, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startPolling = useCallback((txId) => {
    startedAtRef.current = Date.now();

    const tick = async () => {
      if (userClosedRef.current) return;
      if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
        setTopupState('timeout');
        setTopupMsg('No confirmation received. Try again.');
        stopPolling();
        return;
      }
      try {
        const res = await smsAPI.getTopupStatus(txId);
        const payload = res?.data;
        if (payload?.status === 'success') {
          stopPolling();
          setTopupState('success');
          setTopupMsg('Top-up completed');
          await load();
          return;
        }
        if (payload?.status === 'failed') {
          stopPolling();
          setTopupState('failed');
          setTopupMsg(payload?.message || 'Payment failed');
          return;
        }
      } catch {}
      pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
  }, [load, stopPolling]);

  const submitTopup = async () => {
    const amt = Number(amount);
    if (!amt || amt < (data?.config?.minTopupKes || 10)) {
      showToast(`Minimum top-up is KSh ${data?.config?.minTopupKes || 10}`, 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    setTopupState('sending');
    setTopupMsg('');

    try {
      const res = await smsAPI.createTopup({ amountKes: amt, phoneNumber: phone.trim() });
      const payload = res?.data;
      const txId = payload?.transactionId;
      if (!txId) {
        setTopupState('failed');
        setTopupMsg('STK push failed');
        return;
      }
      setTransactionId(txId);
      setTopupState('waiting');
      setTopupMsg(payload?.message || 'Check your phone and enter your PIN');
      startPolling(txId);
    } catch (err) {
      setTopupState('failed');
      setTopupMsg(err.response?.data?.error || 'STK push failed');
    }
  };

  if (loading && !data) return <LoadingSpinner />;

  const wallet = data?.wallet || { balance: 0, currency: 'KES' };
  const config = data?.config || { minTopupKes: 10, rateKes: 1 };
  const topups = data?.recentTopups || [];

  const isBusy = topupState === 'sending' || topupState === 'waiting';

  return (
    <>
      <PageHeader
        title="SMS Wallet"
        description="Top up your balance to send SMS"
        action={
          <Button onClick={() => setShowTopup(true)}>
            <FiPlus className="w-4 h-4 mr-1" /> Top Up
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <FiSmartphone className="w-6 h-6 text-indigo-600" />
            <p className="text-sm text-gray-500">Current balance</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(wallet.balance, wallet.currency || 'KES')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Rate: {formatCurrency(config.rateKes, 'KES')} / SMS
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500 mb-1">Lifetime topped up</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(wallet.lifetimeToppedUp || 0, 'KES')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last: {wallet.lastTopUpAt ? formatDate(wallet.lastTopUpAt) : '—'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500 mb-1">Lifetime spent</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(wallet.lifetimeSpent || 0, 'KES')}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Recent top-ups</h3>
        {topups.length === 0 ? (
          <EmptyState
            icon={FiSmartphone}
            title="No top-ups yet"
            description="Top up your SMS wallet to start sending"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {topups.map((t) => (
                  <tr key={t._id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(t.convertedAmount || t.amount, 'KES')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.paymentMethod || 'M-Pesa'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {t.paymentProvider?.transactionId || t.mpesaDetails?.mpesaReceiptNumber || '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showTopup}
        onClose={() => { userClosedRef.current = true; stopPolling(); setShowTopup(false); }}
        title="Top up SMS Wallet"
        size="sm"
      >
        <div className="space-y-4">
          {topupState === 'idle' && (
            <>
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current balance</span>
                  <span className="font-medium text-gray-900">{formatCurrency(wallet.balance, 'KES')}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-gray-500">Minimum top-up</span>
                  <span className="font-medium text-gray-900">{formatCurrency(config.minTopupKes, 'KES')}</span>
                </div>
              </div>

              <Input
                label="Amount (KES) *"
                type="number"
                min={config.minTopupKes}
                step="1"
                placeholder={`${config.minTopupKes}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                label="M-Pesa phone number *"
                type="tel"
                placeholder="07XX XXX XXX"
                hint="The phone registered with M-Pesa"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

          {topupState === 'sending' && (
            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              <FiLoader className="w-4 h-4 animate-spin" />
              Sending STK push...
            </div>
          )}

          {topupState === 'waiting' && (
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              <FiLoader className="w-4 h-4 animate-spin mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check your phone</p>
                <p className="text-xs mt-0.5">{topupMsg}</p>
                <p className="text-xs mt-1 opacity-70">Waiting for confirmation…</p>
              </div>
            </div>
          )}

          {topupState === 'success' && (
            <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg text-sm text-green-700">
              <FiCheckCircle className="w-5 h-5" />
              <span className="font-medium">Top-up completed!</span>
            </div>
          )}

          {topupState === 'failed' && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg text-sm text-red-700">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{topupMsg}</span>
            </div>
          )}

          {topupState === 'timeout' && (
            <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{topupMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {topupState === 'success' ? (
              <Button onClick={() => setShowTopup(false)} className="w-full">Done</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => { userClosedRef.current = true; stopPolling(); setShowTopup(false); }} disabled={isBusy}>
                  Cancel
                </Button>
                {(topupState === 'failed' || topupState === 'timeout') ? (
                  <Button onClick={() => { userClosedRef.current = false; setTopupState('idle'); setTopupMsg(''); }}>
                    Try again
                  </Button>
                ) : (
                  <Button onClick={submitTopup} loading={topupState === 'sending'} disabled={isBusy || !amount || !phone}>
                    Send STK Push
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}