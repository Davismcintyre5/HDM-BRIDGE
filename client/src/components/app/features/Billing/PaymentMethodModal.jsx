import { useState, useEffect } from 'react';
import Modal from '@components/app/ui/Modal';
import { FiCreditCard, FiSmartphone, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { SiPaypal } from 'react-icons/si';
import { BiBuilding, BiTime } from 'react-icons/bi';

const icons = {
  stripe: FiCreditCard,
  paypal: SiPaypal,
  mpesa: FiSmartphone,
  bank_transfer: BiBuilding,
};

const mpesaSubs = [
  { key: 'paybill', label: 'Paybill', icon: '🏦' },
  { key: 'till', label: 'Till Number', icon: '🛒' },
  { key: 'stkPush', label: 'STK Push', icon: '📱' },
  { key: 'sendMoney', label: 'Send Money', icon: '💸' },
];

export default function PaymentMethodModal({ isOpen, onClose, plan, methods, onSelect }) {
  const [step, setStep] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!isOpen) { setStep('methods'); setSelectedMethod(null); setSelectedSub(null); setPhoneNumber(''); setConfirmed(false); }
  }, [isOpen]);

  const enabledMethods = methods || [];
  const planPrice = plan?.convertedPrice?.formatted || '$' + (plan?.price?.amount || 0);

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    if (method.type === 'mpesa') setStep('mpesaSubs');
    else if (method.type === 'stripe') handleStripe();
    else if (method.type === 'paypal') handlePayPal();
    else if (method.type === 'bank_transfer') setStep('bankInstructions');
  };

  const handleSelectSub = (subKey) => {
    setSelectedSub(subKey);
    if (subKey === 'stkPush') setStep('stkPush');
    else setStep('instructions');
  };

  const handleStripe = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { alert('Payment failed: ' + err.message); }
    setLoading(false);
  };

  const handlePayPal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/billing/paypal', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ planId: plan._id }),
      });
      const data = await res.json();
      if (data.order?.links) {
        const approve = data.order.links.find(l => l.rel === 'approve');
        if (approve) window.location.href = approve.href;
      }
    } catch (err) { alert('Payment failed: ' + err.message); }
    setLoading(false);
  };

  const handleStkPush = async () => {
    if (!phoneNumber) { alert('Enter phone number'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_URL + '/billing/mpesa', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ planId: plan._id, phoneNumber }),
      });
      setStep('submitted');
    } catch (err) { alert('STK Push failed: ' + err.message); }
    setLoading(false);
  };

  const handleManualConfirm = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_URL + '/billing/manual-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          planId: plan._id,
          amount: plan.convertedPrice?.amount || plan.price?.amount,
          currency: plan.convertedPrice?.currency || 'KES',
          method: selectedMethod?.type || 'manual',
          subMethod: selectedSub,
          reference: getSubLabel(selectedSub),
        }),
      });
      setStep('submitted');
    } catch (err) { alert('Failed: ' + err.message); }
    setLoading(false);
  };

  const getSubConfig = () => {
    if (!selectedMethod || !selectedSub) return {};
    return selectedMethod.configuration?.[selectedSub] || {};
  };

  const getInstructions = () => {
    const cfg = getSubConfig();
    switch (selectedSub) {
      case 'paybill':
        return [
          '1. Go to Safaricom M-Pesa menu',
          '2. Select Lipa na M-Pesa',
          '3. Select Paybill',
          '4. Enter Business Number: ' + (cfg.paybillNumber || 'N/A'),
          '5. Enter Account Number: [Your Account]',
          '6. Enter Amount: ' + planPrice,
          '7. Enter your M-Pesa PIN',
          '8. Confirm and send',
          '9. Come back here and confirm you have paid',
        ];
      case 'till':
        return [
          '1. Go to Safaricom M-Pesa menu',
          '2. Select Lipa na M-Pesa',
          '3. Select Buy Goods and Services',
          '4. Enter Till Number: ' + (cfg.tillNumber || 'N/A'),
          '5. Enter Amount: ' + planPrice,
          '6. Enter your M-Pesa PIN',
          '7. Confirm and send',
          '8. Come back here and confirm you have paid',
        ];
      case 'sendMoney':
        return [
          '1. Go to Safaricom M-Pesa menu',
          '2. Select Send Money',
          '3. Enter Phone Number: ' + (cfg.phoneNumber || 'N/A'),
          '4. Enter Amount: ' + planPrice,
          '5. Enter your M-Pesa PIN',
          '6. Confirm and send',
          '7. Come back here and confirm you have paid',
        ];
      default: return [];
    }
  };

  const getSubLabel = (key) => {
    const cfg = selectedMethod?.configuration?.[key] || {};
    switch (key) {
      case 'paybill': return 'Paybill ' + (cfg.paybillNumber || 'N/A');
      case 'till': return 'Till ' + (cfg.tillNumber || 'N/A');
      case 'stkPush': return 'Enter phone, receive prompt';
      case 'sendMoney': return 'Send to ' + (cfg.phoneNumber || 'N/A');
      default: return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'methods' ? 'Select Payment Method' : step === 'mpesaSubs' ? 'M-Pesa Options' : step === 'stkPush' ? 'STK Push Payment' : step === 'instructions' ? 'Payment Instructions' : step === 'bankInstructions' ? 'Bank Transfer' : step === 'submitted' ? 'Submitted' : 'Payment'} size="md">

      {/* Submitted */}
      {step === 'submitted' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📩</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted</h3>
          <p className="text-gray-500 mb-2">Your payment of <strong>{planPrice}</strong> is pending approval.</p>
          <p className="text-xs text-gray-400 mb-6">Admin will verify and activate your plan within 2 hours.</p>
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 font-medium text-sm">
            <BiTime size={18} /> Pending Approval
          </div>
          <button onClick={onClose} className="btn-secondary w-full mt-6">Close</button>
        </div>
      )}

      {/* Step 1: Payment Methods */}
      {step === 'methods' && (
        <>
          <p className="text-sm text-gray-500 mb-4">Upgrade to <strong>{plan?.name}</strong> ({planPrice}/mo)</p>
          {enabledMethods.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payment methods available.</p>
          ) : (
            <div className="space-y-3 mb-6">
              {enabledMethods.map((method) => {
                const Icon = icons[method.type] || FiCreditCard;
                return (
                  <button key={method._id} onClick={() => handleSelectMethod(method)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-indigo-300">
                    <Icon size={24} />
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-900">{method.displayName}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Step 2: M-Pesa Sub-Methods */}
      {step === 'mpesaSubs' && (
        <>
          <button onClick={() => setStep('methods')} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft size={16} className="mr-1" /> Back
          </button>
          <p className="text-sm text-gray-500 mb-4">Select M-Pesa payment option</p>
          <div className="space-y-3 mb-6">
            {mpesaSubs.map((sub) => {
              const cfg = selectedMethod?.configuration?.[sub.key] || {};
              if (!cfg.enabled) return null;
              return (
                <button key={sub.key} onClick={() => handleSelectSub(sub.key)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all">
                  <span className="text-2xl">{sub.icon}</span>
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-900">{sub.label}</p>
                    <p className="text-xs text-gray-500">{getSubLabel(sub.key)}</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Step 3a: STK Push */}
      {step === 'stkPush' && (
        <>
          <button onClick={() => setStep('mpesaSubs')} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft size={16} className="mr-1" /> Back
          </button>
          <p className="text-sm text-gray-500 mb-4">Enter your M-Pesa phone number to receive a payment prompt.</p>
          <div className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" placeholder="e.g., 0712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <p className="text-sm text-gray-600"><strong>Amount:</strong> {planPrice}</p>
            <p className="text-xs text-gray-400">You will receive a prompt on your phone. Enter your PIN to complete payment.</p>
            <button onClick={handleStkPush} disabled={loading || !phoneNumber} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send STK Push'}
            </button>
          </div>
        </>
      )}

      {/* Step 3b: Manual Instructions */}
      {step === 'instructions' && (
        <>
          <button onClick={() => setStep('mpesaSubs')} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft size={16} className="mr-1" /> Back
          </button>
          <p className="font-semibold text-gray-900 mb-2">{selectedSub === 'paybill' ? 'Paybill' : selectedSub === 'till' ? 'Till Number' : 'Send Money'} Payment</p>
          <p className="text-sm text-gray-500 mb-4"><strong>Amount:</strong> {planPrice}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Follow these steps:</p>
            {getInstructions().map((step, i) => (
              <p key={i} className="text-sm text-gray-700 mb-1">{step}</p>
            ))}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 rounded" />
              <span className="text-sm text-yellow-800">
                I confirm I have paid <strong>{planPrice}</strong> via {getSubLabel(selectedSub)}
              </span>
            </label>
          </div>
          <p className="text-xs text-red-500 mb-4">⚠️ Unconfirmed payments will be auto-rejected in 2 hours.</p>
          <button onClick={handleManualConfirm} disabled={!confirmed || loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Submit Confirmation'}
          </button>
        </>
      )}

      {/* Step 3c: Bank Transfer */}
      {step === 'bankInstructions' && (
        <>
          <button onClick={() => setStep('methods')} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft size={16} className="mr-1" /> Back
          </button>
          <p className="font-semibold text-gray-900 mb-2">Bank Transfer</p>
          <p className="text-sm text-gray-500 mb-4"><strong>Amount:</strong> {planPrice}</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
            {selectedMethod?.configuration?.bankName && <p><strong>Bank:</strong> {selectedMethod.configuration.bankName}</p>}
            {selectedMethod?.configuration?.accountName && <p><strong>Account Name:</strong> {selectedMethod.configuration.accountName}</p>}
            {selectedMethod?.configuration?.accountNumber && <p><strong>Account Number:</strong> {selectedMethod.configuration.accountNumber}</p>}
            {selectedMethod?.configuration?.swiftCode && <p><strong>SWIFT:</strong> {selectedMethod.configuration.swiftCode}</p>}
            <p className="text-xs text-gray-400 mt-2">{selectedMethod?.configuration?.instructions || 'Use invoice number as reference.'}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 rounded" />
              <span className="text-sm text-yellow-800">I confirm I have transferred <strong>{planPrice}</strong></span>
            </label>
          </div>
          <p className="text-xs text-red-500 mb-4">⚠️ Unconfirmed payments will be auto-rejected in 2 hours.</p>
          <button onClick={handleManualConfirm} disabled={!confirmed || loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Submit Confirmation'}
          </button>
        </>
      )}
    </Modal>
  );
}