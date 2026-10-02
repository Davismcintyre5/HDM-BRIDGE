import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhone, FiCreditCard, FiAlertTriangle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import PageHeader from '@components/app/ui/PageHeader';
import Card from '@components/app/ui/Card';
import Button from '@components/app/ui/Button';
import Spinner from '@components/app/ui/LoadingSpinner';
import PaymentInstructions from '@components/app/features/Billing/PaymentInstructions';
import PayWithMpesaModal from '@components/app/features/Billing/PayWithMpesaModal';
import { billingAPI } from '@api/billing';
import { formatMoney } from '@utils/currency';
import { formatDate } from '@utils/helpers';

export default function Renew() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await billingAPI.getRenewData();
      setData(res?.data);
      if (res?.data?.needsRenewal === false) {
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load renewal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!data?.needsRenewal) return;
    setPolling(true);
    const t = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(t);
  }, [data?.needsRenewal]);

  const handleStripe = async () => {
    if (!data?.invoice?.invoiceNumber) return;
    setPaying('stripe');
    try {
      const res = await billingAPI.payInvoice(data.invoice.invoiceNumber, 'stripe');
      const payload = res?.data?.data || res?.data || res;
      if (payload?.url) window.location.href = payload.url;
      else setPaying(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Stripe checkout failed');
      setPaying(null);
    }
  };

  const handlePayPal = async () => {
    if (!data?.invoice?.invoiceNumber) return;
    setPaying('paypal');
    try {
      const res = await billingAPI.payInvoice(data.invoice.invoiceNumber, 'paypal');
      const payload = res?.data?.data || res?.data || res;
      const approve = payload?.order?.links?.find((l) => l.rel === 'approve');
      if (approve?.href) window.location.href = approve.href;
      else setPaying(null);
    } catch (err) {
      alert(err.response?.data?.error || 'PayPal checkout failed');
      setPaying(null);
    }
  };

  const handlePaymentSuccess = () => {
    setMpesaOpen(false);
    setTimeout(() => fetchData(), 800);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <FiAlertTriangle className="mx-auto text-red-500 w-10 h-10 mb-4" />
        <p className="text-lg font-semibold text-gray-900">Something went wrong</p>
        <p className="mt-2 text-sm text-gray-500">{error || 'No data'}</p>
        <Button onClick={() => fetchData()} className="mt-6">Retry</Button>
      </div>
    );
  }

  const { subscription, invoice } = data;
  const currency = invoice?.currency || 'USD';
  const hasStk = invoice?.paymentInstructions?.some((p) => p.code === 'mpesa_stk');
  const hasStripe = invoice?.paymentInstructions?.some((p) => p.code === 'stripe');
  const hasPaypal = invoice?.paymentInstructions?.some((p) => p.code === 'paypal');

  return (
    <>
      <PageHeader title="Renew subscription" description="Restore access to your plan" />

      <div className="max-w-2xl mx-auto space-y-6">

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Your {subscription?.planName || 'paid'} plan has been suspended
            </p>
            <p className="text-xs text-red-700 mt-1">
              {subscription?.frozenAt
                ? `Suspended on ${formatDate(subscription.frozenAt, 'full')}.`
                : 'Pay the invoice below to restore access.'}
              {' '}Your API keys, domains, templates, and data are preserved.
            </p>
          </div>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Invoice</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 font-mono">
                {invoice?.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Due</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(invoice?.dueDate)}</p>
            </div>
          </div>

          <div className="py-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Plan</span>
              <span className="text-gray-900 font-medium">{subscription?.planName}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Amount due</span>
              <span className="text-gray-900 font-semibold">{formatMoney(invoice?.total, currency)}</span>
            </div>
          </div>

          {!hasStk && !hasStripe && !hasPaypal && (
            <div className="mt-2 text-sm text-gray-500">
              No online payment methods are available. Use the manual instructions below.
            </div>
          )}

          {(hasStk || hasStripe || hasPaypal) && (
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-2">
              {hasStk && (
                <Button size="lg" onClick={() => setMpesaOpen(true)} className="w-full">
                  <FiPhone className="w-4 h-4 mr-1" /> Pay with M-Pesa
                </Button>
              )}
              {hasStripe && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleStripe}
                  loading={paying === 'stripe'}
                  className="w-full"
                >
                  <FiCreditCard className="w-4 h-4 mr-1" /> Pay with Card
                </Button>
              )}
              {hasPaypal && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handlePayPal}
                  loading={paying === 'paypal'}
                  className="w-full"
                >
                  Pay with PayPal
                </Button>
              )}
            </div>
          )}

          {invoice?.paymentInstructions?.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Other payment methods</p>
              <PaymentInstructions instructions={invoice.paymentInstructions} hideStk />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">What you'll get back</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Email sending via API and dashboard</li>
            <li>All existing API keys continue working</li>
            <li>Your domains, senders, templates, and data are untouched</li>
            <li>Rate limits return to your {subscription?.planName} plan</li>
          </ul>
        </Card>

        {polling && (
          <p className="text-xs text-gray-400 text-center">
            <FiLoader className="inline w-3 h-3 mr-1 animate-spin" />
            Checking payment status every 15 seconds…
          </p>
        )}
      </div>

      {hasStk && invoice?.invoiceNumber && (
        <PayWithMpesaModal
          open={mpesaOpen}
          onClose={() => setMpesaOpen(false)}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.total}
          currency={currency}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}