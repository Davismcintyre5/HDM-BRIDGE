import api from './axios';

export const billingAPI = {
  getSubscription: () => api.get('/billing/subscription'),
  getPlans: () => api.get('/billing/plans'),
  getUsage: () => api.get('/billing/usage'),
  getTransactions: (page = 1) => api.get('/billing/transactions', { params: { page } }),

  createInvoice: (planId) => api.post('/billing/invoice', { planId }),
  getInvoice: (invoiceNumber) => api.get(`/billing/invoice/${invoiceNumber}`),
  getPendingInvoice: () => api.get('/billing/invoice/pending/current'),
  getRenewData: () => api.get('/billing/renew'),
  payInvoice: (invoiceNumber, method, extra = {}) =>
    api.post(`/billing/invoice/${invoiceNumber}/pay`, { method, ...extra }),
  getMpesaStatus: (checkoutRequestId) =>
    api.get(`/billing/mpesa/status/${checkoutRequestId}`),

  checkout: (planId) => api.post('/billing/checkout', { planId }),
  mpesaPayment: (phoneNumber, planId) => api.post('/billing/mpesa', { phoneNumber, planId }),
  paypalPayment: (planId) => api.post('/billing/paypal', { planId }),
};