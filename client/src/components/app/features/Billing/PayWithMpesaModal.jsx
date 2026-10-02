import { useState, useEffect, useRef, useCallback } from 'react';
import { FiPhone, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Modal from '@components/app/ui/Modal';
import Input from '@components/app/ui/Input';
import Button from '@components/app/ui/Button';
import { billingAPI } from '@api/billing';
import { formatMoney } from '@utils/currency';

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 5 * 60 * 1000;

export default function PayWithMpesaModal({ open, onClose, invoiceNumber, amount, currency = 'KES', onSuccess }) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    if (!open) {
      stopPolling();
      setState('idle');
      setPhone('');
      setMessage('');
      startedAtRef.current = null;
      userClosedRef.current = false;
    }
  }, [open, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const finishSuccess = useCallback(() => {
    stopPolling();
    setState('success');
    setMessage('Payment received');
    if (onSuccess) setTimeout(() => onSuccess(), 1200);
  }, [stopPolling, onSuccess]);

  const finishFailure = useCallback((msg) => {
    stopPolling();
    setState('failed');
    setMessage(msg || 'Payment failed');
  }, [stopPolling]);

  const startPolling = useCallback((checkoutRequestId) => {
    startedAtRef.current = Date.now();

    const tick = async () => {
      if (userClosedRef.current) return;

      if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
        setState('timeout');
        setMessage('No confirmation received. Try again.');
        stopPolling();
        return;
      }

      try {
        const res = await billingAPI.getMpesaStatus(checkoutRequestId);
        const payload = res?.data?.data || res?.data || res;
        const status = payload?.status;

        if (status === 'success') {
          finishSuccess();
          return;
        }
        if (status === 'failed') {
          finishFailure(payload?.message || 'Payment failed');
          return;
        }
      } catch {}

      pollTimerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
  }, [finishSuccess, finishFailure, stopPolling]);

  const submit = async () => {
    const cleaned = phone.trim();
    if (!cleaned) return;

    setState('sending');
    setMessage('');

    try {
      const res = await billingAPI.payInvoice(invoiceNumber, 'mpesa_stk', { phoneNumber: cleaned });
      const payload = res?.data?.data || res?.data || res;
      const checkoutRequestId = payload?.checkoutRequestId;

      if (!checkoutRequestId) {
        finishFailure('STK push failed. Try again.');
        return;
      }

      setState('waiting');
      setMessage(payload?.message || 'Check your phone and enter your PIN.');
      startPolling(checkoutRequestId);
    } catch (err) {
      finishFailure(err.response?.data?.error || err.response?.data?.message || 'STK push failed. Try again.');
    }
  };

  const handleClose = () => {
    userClosedRef.current = true;
    stopPolling();
    onClose();
  };

  const retry = () => {
    userClosedRef.current = false;
    startedAtRef.current = null;
    setState('idle');
    setMessage('');
  };

  const isBusy = state === 'sending' || state === 'waiting';

  return (
    <Modal isOpen={open} onClose={handleClose} title="Pay with M-Pesa" size="sm">
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Invoice</span>
            <span className="font-mono text-xs text-gray-900">{invoiceNumber}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-gray-900">
              {formatMoney(amount, currency)}
            </span>
          </div>
        </div>

        {state === 'idle' && (
          <>
            <p className="text-sm text-gray-600">
              Enter the phone number registered with M-Pesa. You'll receive a prompt on your phone.
            </p>
            <Input
              label="M-Pesa Phone Number"
              type="tel"
              placeholder="07XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isBusy}
            />
          </>
        )}

        {state === 'sending' && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <FiLoader className="w-4 h-4 animate-spin" />
            Sending STK push...
          </div>
        )}

        {state === 'waiting' && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <FiLoader className="w-4 h-4 animate-spin mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Check your phone</p>
              <p className="text-xs mt-0.5">{message}</p>
              <p className="text-xs mt-1 opacity-70">Waiting for confirmation…</p>
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">Payment received. Thank you!</span>
          </div>
        )}

        {state === 'failed' && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {state === 'timeout' && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          {state === 'success' ? (
            <Button onClick={handleClose} className="w-full">Close</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose} disabled={state === 'sending'}>
                Cancel
              </Button>
              {(state === 'failed' || state === 'timeout') ? (
                <Button onClick={retry}>Send again</Button>
              ) : (
                <Button onClick={submit} loading={state === 'sending'} disabled={isBusy || !phone.trim()}>
                  <FiPhone className="w-4 h-4 mr-1" /> Send STK
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}