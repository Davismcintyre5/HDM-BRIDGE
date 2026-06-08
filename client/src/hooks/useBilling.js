import { useState } from 'react';
import { billingAPI } from '../api/billing';

export const useBilling = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.getSubscription();
      setSubscription(data.subscription);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    const { data } = await billingAPI.getPlans();
    setPlans(data.plans);
  };

  const fetchUsage = async () => {
    const { data } = await billingAPI.getUsage();
    setUsage(data.usage);
  };

  const checkout = async (planId) => {
    const { data } = await billingAPI.checkout(planId);
    window.location.href = data.url;
  };

  const fetchTransactions = async (page = 1) => {
    const { data } = await billingAPI.getTransactions(page);
    setTransactions(data.data);
  };

  return { subscription, plans, usage, transactions, loading, fetchSubscription, fetchPlans, fetchUsage, checkout, fetchTransactions };
};