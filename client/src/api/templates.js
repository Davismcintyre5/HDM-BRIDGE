import api from './axios';

export const templatesAPI = {
  getAll: (page = 1, limit = 20) => api.get('/templates', { params: { page, limit } }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
};