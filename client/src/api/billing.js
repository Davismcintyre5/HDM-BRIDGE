import api from './axios';

export const billingAPI = {
  getSubscription: () => api.get('/billing/subscription'),
  getPlans: () => api.get('/billing/plans'),
  getUsage: () => api.get('/billing/usage'),
  checkout: (planId) => api.post('/billing/checkout', { planId }),
  mpesaPayment: (phoneNumber, planId) => api.post('/billing/mpesa', { phoneNumber, planId }),
  paypalPayment: (planId) => api.post('/billing/paypal', { planId }),
  getTransactions: (page = 1) => api.get('/billing/transactions', { params: { page } }),
};