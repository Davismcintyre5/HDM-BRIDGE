import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Password reset</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your password has been updated. Redirecting to login…
          </p>
          <Link to="/login" className="btn-primary w-full py-3 block text-center rounded-xl">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-2">Reset your password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Choose a new password for your account.
        </p>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}