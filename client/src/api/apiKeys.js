import api from './axios';

export const apiKeysAPI = {
  getAll: () => api.get('/api-keys'),
  create: (data) => api.post('/api-keys', data),
  update: (id, data) => api.put(`/api-keys/${id}`, data),
  revoke: (id) => api.delete(`/api-keys/${id}`),
};