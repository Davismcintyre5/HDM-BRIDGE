import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
          <p className="text-sm text-gray-500 mb-2">
            If <strong>{email}</strong> is registered, a password reset link is on its way.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            The link expires in 60 minutes.
          </p>
          <Link to="/login" className="btn-primary w-full py-3 block text-center rounded-xl">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we'll send you a reset link.
        </p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Remembered it? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}