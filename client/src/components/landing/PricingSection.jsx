import { useState, useEffect } from 'react';
import PricingCard from './PricingCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PricingSection() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/landing/plans`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (err) {
      setPlans([
        { name: 'Free', tier: 'free', price: { amount: 0 }, convertedPrice: { formatted: '—', amount: 0 }, limits: { monthlyEmails: 3000 }, metadata: { isRecommended: false } },
        { name: 'Pro', tier: 'pro', price: { amount: 19 }, convertedPrice: { formatted: '—', amount: 19 }, limits: { monthlyEmails: 50000 }, metadata: { isRecommended: true, badge: 'Popular' } },
        { name: 'Pro+', tier: 'proplus', price: { amount: 79 }, convertedPrice: { formatted: '—', amount: 79 }, limits: { monthlyEmails: 500000 }, metadata: { isRecommended: false, badge: 'Best Value' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-500">Start free, upgrade as you grow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}