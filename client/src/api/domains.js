import api from './axios';

export const domainsAPI = {
  getAll: () => api.get('/domains'),
  add: (domain) => api.post('/domains', { domain }),
  verify: (id) => api.post(`/domains/${id}/verify`),
  delete: (id) => api.delete(`/domains/${id}`),
};