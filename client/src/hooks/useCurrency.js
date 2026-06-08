import { useState, useEffect } from 'react';
import { currencyAPI } from '../api/currency';

export const useCurrency = () => {
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const { data } = await currencyAPI.getSupported();
      setCurrencies(data.currencies);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const { data } = await currencyAPI.getRates();
      setRates(data.rates);
    } catch {
      // silent
    }
  };

  const setPreference = async (currency) => {
    await currencyAPI.setPreference(currency);
  };

  const convert = async (amount, from, to) => {
    const { data } = await currencyAPI.convert(amount, from, to);
    return data;
  };

  return { currencies, rates, loading, fetchCurrencies, fetchRates, setPreference, convert };
};