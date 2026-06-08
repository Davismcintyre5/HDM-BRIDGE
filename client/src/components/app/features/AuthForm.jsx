import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function AuthForm({ type }) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', organizationName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (type === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md w-full">
      <h2 className="text-2xl font-bold text-center mb-6">
        {type === 'login' ? 'Log in to HDM BRIDGE' : 'Create your account'}
      </h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input type="text" name="firstName" className="input" value={form.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" name="lastName" className="input" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required />
        </div>
        {type === 'register' && (
          <div>
            <label className="label">Organization</label>
            <input type="text" name="organizationName" className="input" value={form.organizationName} onChange={handleChange} required />
          </div>
        )}
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" className="input" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Loading...' : type === 'login' ? 'Log in' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        {type === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <Link to={type === 'login' ? '/register' : '/login'} className="text-indigo-600 hover:underline">
          {type === 'login' ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </div>
  );
}