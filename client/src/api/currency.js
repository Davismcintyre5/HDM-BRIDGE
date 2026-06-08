import api from './axios';

export const currencyAPI = {
  getSupported: () => api.get('/currency/supported'),
  getRates: () => api.get('/currency/rates'),
  setPreference: (currency) => api.put('/currency/preference', { currency }),
  convert: (amount, from, to) => api.post('/currency/convert', { amount, from, to }),
};