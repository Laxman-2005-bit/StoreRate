import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to all outgoing requests
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

// Interceptor to handle common responses and authentication errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Check if unauthorized and was authenticated before
    if (error.response?.status === 401) {
      const currentToken = localStorage.getItem('token');
      if (currentToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'An unexpected network error occurred.';

    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
      data: error.response?.data,
    });
  }
);

export default api;
