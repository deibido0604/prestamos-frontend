import axios from 'axios';
import { useMemo } from 'react';

export const useApi = () => {
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api-prestamos',
      headers: { 'Content-Type': 'application/json' },
    });

    // Interceptores para token, etc.
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token'); // o donde guardes el token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  return api;
};