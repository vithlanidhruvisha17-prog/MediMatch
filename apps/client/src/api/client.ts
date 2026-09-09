import axios from 'axios';

export const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('medimatch_token') || localStorage.getItem('medimatch_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path.startsWith('/admin') && path !== '/admin/login') {
        localStorage.removeItem('medimatch_token');
        localStorage.removeItem('medimatch_user');
        localStorage.removeItem('medimatch_admin_token');
        localStorage.removeItem('medimatch_admin_user');
        window.location.href = '/admin/login';
      } else if (path === '/assessment' || path === '/account') {
        localStorage.removeItem('medimatch_token');
        localStorage.removeItem('medimatch_user');
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }
    return Promise.reject(error);
  }
);

