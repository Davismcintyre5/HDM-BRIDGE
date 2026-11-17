import api from './axios';

export const smsAPI = {
  send: (data) => api.post('/sms/compose', data),
  getLogs: (params) => api.get('/sms/logs', { params }),
  getStats: () => api.get('/sms/stats'),
  getWallet: () => api.get('/sms/wallet'),
  createTopup: (data) => api.post('/sms/topup', data),
  getTopupStatus: (transactionId) => api.get(`/sms/topup/${transactionId}`),
};