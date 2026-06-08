import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LegalModal from '../../components/landing/LegalModal';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', organizationName: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError('You must agree to the Terms and Privacy Policy'); return; }
    setError(''); setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
          <p className="text-gray-500 mb-2">We sent a verification link to</p>
          <p className="text-indigo-600 font-semibold text-lg mb-6">{form.email}</p>
          <p className="text-sm text-gray-400 mb-8">Click the link in the email to activate your account. The link expires in 24 hours.</p>
          <div className="space-y-3">
            <Link to="/login" className="btn-primary w-full py-3 block text-center rounded-xl">Go to Login</Link>
            <button onClick={() => setSuccess(false)} className="text-sm text-gray-500 hover:text-gray-700">Use a different email</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input type="text" name="firstName" className="input" value={form.firstName} onChange={handleChange} required /></div>
            <div><label className="label">Last Name</label><input type="text" name="lastName" className="input" value={form.lastName} onChange={handleChange} required /></div>
          </div>
          <div><label className="label">Email</label><input type="email" name="email" className="input" value={form.email} onChange={handleChange} required /></div>
          <div><label className="label">Organization</label><input type="text" name="organizationName" className="input" value={form.organizationName} onChange={handleChange} required /></div>
          <div><label className="label">Password</label><input type="password" name="password" className="input" value={form.password} onChange={handleChange} required /></div>
          <label className="flex items-start space-x-2 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-500">
              I agree to the <button type="button" onClick={() => setLegalModal('terms')} className="text-indigo-600 hover:underline">Terms of Service</button> and <button type="button" onClick={() => setLegalModal('privacy')} className="text-indigo-600 hover:underline">Privacy Policy</button>
            </span>
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>

      <LegalModal isOpen={legalModal === 'terms'} onClose={() => setLegalModal(null)} title="Terms of Service">
        <h4 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h4>
        <p className="mb-4">By accessing and using HDM BRIDGE, you agree to be bound by these Terms of Service.</p>
        <h4 className="font-semibold text-gray-900 mb-2">2. Description of Service</h4>
        <p className="mb-4">HDM BRIDGE provides an email sending platform for transactional and marketing emails via API or SMTP.</p>
        <h4 className="font-semibold text-gray-900 mb-2">3. User Obligations</h4>
        <p className="mb-4">You agree to use the service in compliance with all applicable laws and regulations.</p>
        <h4 className="font-semibold text-gray-900 mb-2">4. Prohibited Activities</h4>
        <p>You may not use the service for spam, phishing, or any illegal activities.</p>
      </LegalModal>

      <LegalModal isOpen={legalModal === 'privacy'} onClose={() => setLegalModal(null)} title="Privacy Policy">
        <h4 className="font-semibold text-gray-900 mb-2">1. Information Collection</h4>
        <p className="mb-4">We collect information necessary to provide our email sending services.</p>
        <h4 className="font-semibold text-gray-900 mb-2">2. Use of Information</h4>
        <p className="mb-4">Your data is used solely for providing and improving our services.</p>
        <h4 className="font-semibold text-gray-900 mb-2">3. Data Protection</h4>
        <p>We implement security measures including encryption and secure access controls.</p>
      </LegalModal>
    </div>
  );
}