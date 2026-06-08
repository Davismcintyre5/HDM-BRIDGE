import api from './axios';

export const emailsAPI = {
  send: (data) => api.post('/emails/send', data),
  sendBulk: (data) => api.post('/emails/send-bulk', data),
  compose: (data) => api.post('/emails/compose', data),
  getStatus: (messageId) => api.get(`/emails/status/${messageId}`),
};