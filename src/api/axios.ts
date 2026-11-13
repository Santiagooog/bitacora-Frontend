import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token a TODAS las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: manejar 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ruta = error.config?.url ?? "";
    const esAutenticacion = ruta.includes("/auth/login") || ruta.includes("/auth/register");

    if (!esAutenticacion && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
