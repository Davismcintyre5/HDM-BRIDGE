import api from './axios';

export const emailsAPI = {
  send: (data) => api.post('/emails/send', data),
  sendBulk: (data) => api.post('/emails/send-bulk', data),
  getStatus: (messageId) => api.get(`/emails/status/${messageId}`),
};