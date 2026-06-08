import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', organizationName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input type="text" name="firstName" className="input" value={form.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" name="lastName" className="input" value={form.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" className="input" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Organization Name</label>
            <input type="text" name="organizationName" className="input" value={form.organizationName} onChange={handleChange} placeholder="My Company" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" name="password" className="input" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}