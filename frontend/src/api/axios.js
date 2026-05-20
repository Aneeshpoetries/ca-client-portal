import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname);
    const isAuthEndpoint = url.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint && !isAuthPage) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
