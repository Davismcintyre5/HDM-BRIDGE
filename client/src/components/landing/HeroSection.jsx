import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function HeroSection() {
  const [smsRate, setSmsRate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/landing/sms-config`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.success) setSmsRate(d.config.rateKes);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const smsDisplay = smsRate != null ? `${smsRate} KSh` : 'PayG';

  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Send Emails &amp; SMS From Your App{' '}
          <span className="text-indigo-600">Instantly</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto">
          Simple API. Reliable delivery. No SMTP or SMS gateway hassle. HDM BRIDGE handles
          the infrastructure so you can focus on your product.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="btn-primary btn-lg rounded-full px-8 py-4 text-lg"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="btn-secondary btn-lg rounded-full px-8 py-4 text-lg"
          >
            Learn More
          </a>
        </div>
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="stat-value text-indigo-600">3,000</div>
            <div className="stat-label">emails free/month</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-indigo-600">{smsDisplay}</div>
            <div className="stat-label">per SMS</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-indigo-600">API</div>
            <div className="stat-label">keys in seconds</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-indigo-600">Real</div>
            <div className="stat-label">time tracking</div>
          </div>
        </div>
      </div>
    </section>
  );
}