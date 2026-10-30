import api from './axios';

export const sendersAPI = {
  getAll: () => api.get('/senders'),
  getPlatform: () => api.get('/senders/platform'),
  add: (data) => api.post('/senders', data),
  setDefault: (id) => api.put(`/senders/${id}/default`),
  delete: (id) => api.delete(`/senders/${id}`),
};