import axios from 'axios';
import { getTokenFromStorage } from '@utils/auth';
import { endpoints } from '@utils';

export const useApi = () => {
  const axiosInstance = axios.create({
    baseURL: endpoints.API_BASE || 'http://localhost:3000/api-prestamos',
    headers: { 'Content-Type': 'application/json' },
  });

  // Interceptor para agregar token
  axiosInstance.interceptors.request.use((config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // callService wrapper que retorna fluent API
  const callService = ({ url, errorCallback }) => ({
    get: async (options = {}) => {
      try {
        const res = await axiosInstance.get(url, options);
        return res.data?.data || res.data;
      } catch (error) {
        return errorCallback?.(error.response?.data?.message || error.message);
      }
    },
    post: async (data, options = {}) => {
      try {
        const res = await axiosInstance.post(url, data, options);
        return res.data?.data || res.data;
      } catch (error) {
        return errorCallback?.(error.response?.data?.message || error.message);
      }
    },
    put: async (data, options = {}) => {
      try {
        const res = await axiosInstance.put(url, data, options);
        return res.data?.data || res.data;
      } catch (error) {
        return errorCallback?.(error.response?.data?.message || error.message);
      }
    },
    delete: async (options = {}) => {
      try {
        const res = await axiosInstance.delete(url, options);
        return res.data?.data || res.data;
      } catch (error) {
        return errorCallback?.(error.response?.data?.message || error.message);
      }
    },
  });

  return { api: axiosInstance, callService };
};