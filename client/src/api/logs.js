import api from './axios';

export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  getStats: (params) => api.get('/logs/stats', { params }),
};