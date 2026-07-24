/**
 * Axios API client for LeadDesk Mini.
 * Configures base URL, JWT interceptor, and auto-logout on 401.
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leaddesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('leaddesk_token');
      localStorage.removeItem('leaddesk_user');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth APIs =====
export const loginAPI = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

// ===== Lead APIs (Public) =====
export const submitLeadAPI = async (leadData) => {
  const response = await api.post('/api/leads', leadData);
  return response.data;
};

export const getPublicStatsAPI = async () => {
  const response = await api.get('/api/leads/public/stats');
  return response.data;
};

// ===== Lead APIs (Protected) =====
export const getLeadsAPI = async (page = 1, limit = 10) => {
  const response = await api.get('/api/leads', {
    params: { page, limit },
  });
  return response.data;
};

export const searchLeadsAPI = async ({ q = '', status = '', budget = '', page = 1, limit = 10 }) => {
  const response = await api.get('/api/leads/search', {
    params: { q, status, budget, page, limit },
  });
  return response.data;
};

export const updateLeadStatusAPI = async (leadId, status) => {
  const response = await api.patch(`/api/leads/${leadId}/status`, { status });
  return response.data;
};

// ===== Dashboard APIs (Protected) =====
export const getDashboardStatsAPI = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export default api;
