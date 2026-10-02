import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiCreditCard, FiFileText, FiArrowLeft } from 'react-icons/fi';
import PageHeader from '@components/app/ui/PageHeader';
import Card from '@components/app/ui/Card';
import Button from '@components/app/ui/Button';
import Spinner from '@components/app/ui/LoadingSpinner';
import InvoiceStatusCard from '@components/app/features/Billing/InvoiceStatusCard';
import PaymentInstructions from '@components/app/features/Billing/PaymentInstructions';
import PayWithMpesaModal from '@components/app/features/Billing/PayWithMpesaModal';
import { billingAPI } from '@api/billing';
import { formatMoney } from '@utils/currency';
import { formatDate } from '@utils/helpers';

export default function Invoice() {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);
  const [mpesaOpen, setMpesaOpen] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await billingAPI.getInvoice(invoiceNumber);
      const payload = res?.data?.invoice || res?.data?.data?.invoice || res?.data;
      setInvoice(payload);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [invoiceNumber]);

  const handleStripePay = async () => {
    setPaying('stripe');
    try {
      const res = await billingAPI.payInvoice(invoiceNumber, 'stripe');
      const payload = res?.data?.data || res?.data || res;
      if (payload?.url) window.location.href = payload.url;
      else setPaying(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Stripe checkout failed');
      setPaying(null);
    }
  };

  const handlePayPalPay = async () => {
    setPaying('paypal');
    try {
      const res = await billingAPI.payInvoice(invoiceNumber, 'paypal');
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
    setTimeout(() => fetchInvoice(), 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Invoice not found</p>
        <p className="mt-2 text-sm text-gray-500">{error || 'Check the link or contact support.'}</p>
        <Link to="/billing" className="inline-block mt-6 text-indigo-600 hover:underline">
          <FiArrowLeft className="inline w-4 h-4 mr-1" /> Back to Billing
        </Link>
      </div>
    );
  }

  const paid = invoice.status === 'paid';
  const currency = invoice.currency || 'USD';
  const hasStk = invoice.paymentInstructions?.some((p) => p.code === 'mpesa_stk');
  const hasStripe = invoice.paymentInstructions?.some((p) => p.code === 'stripe');
  const hasPaypal = invoice.paymentInstructions?.some((p) => p.code === 'paypal');

  return (
    <>
      <PageHeader title="Invoice" description={`Invoice ${invoice.invoiceNumber}`} />

      <div className="max-w-2xl mx-auto space-y-6">
        <InvoiceStatusCard status={invoice.status} />

        <Card>
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Invoice</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Issued</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.issuedAt)}</p>
              <p className="mt-1 text-xs text-gray-500">Due {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="py-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Billed to</p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {invoice.customerSnapshot?.name || '—'}
            </p>
            {invoice.customerSnapshot?.email && (
              <p className="text-xs text-gray-500">{invoice.customerSnapshot.email}</p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-3 text-gray-900">
                      {item.name}
                      {item.description && (
                        <span className="block text-xs text-gray-500">{item.description}</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {formatMoney(item.subtotal, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatMoney(invoice.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatMoney(invoice.total, currency)}</span>
            </div>
            {!paid && (
              <div className="flex justify-between text-sm font-semibold text-yellow-600">
                <span>Amount due</span>
                <span>{formatMoney(invoice.amountDue, currency)}</span>
              </div>
            )}
          </div>

          {!paid && (
            <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
              {hasStk && (
                <Button size="lg" onClick={() => setMpesaOpen(true)} className="w-full">
                  <FiPhone className="w-4 h-4 mr-1" /> Pay with M-Pesa
                </Button>
              )}
              {hasStripe && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleStripePay}
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
                  onClick={handlePayPalPay}
                  loading={paying === 'paypal'}
                  className="w-full"
                >
                  Pay with PayPal
                </Button>
              )}
            </div>
          )}

          {!paid && invoice.paymentInstructions?.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Other payment methods</p>
              <PaymentInstructions instructions={invoice.paymentInstructions} hideStk />
            </div>
          )}

          {invoice.notes && (
            <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
              {invoice.notes}
            </div>
          )}
        </Card>

        <div className="text-center">
          <Link to="/billing" className="text-xs text-gray-500 hover:text-gray-900">
            <FiArrowLeft className="inline w-3 h-3 mr-1" /> Back to Billing
          </Link>
        </div>

        <div className="text-center">
          <a href="mailto:support@hdmbridge.com" className="text-xs text-gray-500 hover:text-gray-900">
            Questions? support@hdmbridge.com
          </a>
        </div>
      </div>

      {!paid && hasStk && (
        <PayWithMpesaModal
          open={mpesaOpen}
          onClose={() => setMpesaOpen(false)}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.amountDue}
          currency={currency}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}