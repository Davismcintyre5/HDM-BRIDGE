import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const path = window.location.pathname;

    if (status === 401) {
      localStorage.removeItem('token');
      if (path !== '/login') window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 402 && code === 'PAYMENT_REQUIRED') {
      if (path !== '/renew' && path !== '/login' && path !== '/register') {
        window.location.href = '/renew';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;