import api from './axios';

export const chatAPI = {
  send: (message, sessionId) => api.post('/chat/send', { message, sessionId }),
  getSessions: () => api.get('/chat/sessions'),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
  closeSession: (sessionId) => api.put(`/chat/sessions/${sessionId}/close`),
};