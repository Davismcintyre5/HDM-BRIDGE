import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) verify();
  }, [token]);

  const verify = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else if (data.error?.includes('Invalid or expired')) {
        setStatus('already-done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-500 mt-2">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <FiCheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">Your account is now active and ready to use.</p>
            <Link to="/login" className="btn-primary w-full py-3 block text-center rounded-xl">Go to Login</Link>
          </div>
        )}

        {status === 'already-done' && (
          <div>
            <FiInfo size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Verified</h2>
            <p className="text-gray-500 mb-6">Your email has already been verified. You can log in to your account.</p>
            <Link to="/login" className="btn-primary w-full py-3 block text-center rounded-xl">Go to Login</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <FiXCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">This link is invalid or expired. Please request a new verification email.</p>
            <Link to="/register" className="btn-secondary w-full py-3 block text-center rounded-xl">Sign Up Again</Link>
          </div>
        )}
      </div>
    </div>
  );
}