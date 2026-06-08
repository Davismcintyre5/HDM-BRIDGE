import { useState, useEffect } from 'react';
import { currencyAPI } from '@api/currency';
import { useAuth } from '@context/AuthContext';
import { useApp } from '@context/AppContext';

export default function CurrencySection() {
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();
  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState(user?.preferredCurrency || 'USD');

  useEffect(() => { currencyAPI.getSupported().then(({ data }) => setCurrencies(data.currencies || [])); }, []);

  const handleChange = async (code) => {
    setSelected(code);
    try { await currencyAPI.setPreference(code); updateUser({ ...user, preferredCurrency: code }); showToast('Currency updated', 'success'); } catch { showToast('Failed', 'error'); }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency</h3>
      <select className="input max-w-xs" value={selected} onChange={(e) => handleChange(e.target.value)}>
        {currencies.filter(c => c.isActive).map((c) => (<option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>))}
      </select>
    </div>
  );
}