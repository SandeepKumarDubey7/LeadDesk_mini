/**
 * Axios API client for LeadDesk Mini.
 * Configures base URL, JWT interceptor, and auto-logout on 401.
 * Includes all API functions for leads, auth, analytics, export, notes, and admin.
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
export const submitLeadAPI = async (formData) => {
  // formData is a FormData object (multipart/form-data for file upload)
  const response = await api.post('/api/leads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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

// ===== Notes APIs (Protected) =====
export const addNoteAPI = async (leadId, text) => {
  const response = await api.post(`/api/leads/${leadId}/notes`, { text });
  return response.data;
};

export const getNotesAPI = async (leadId) => {
  const response = await api.get(`/api/leads/${leadId}/notes`);
  return response.data;
};

export const getTimelineAPI = async (leadId) => {
  const response = await api.get(`/api/leads/${leadId}/timeline`);
  return response.data;
};

// ===== Attachment Download (Protected) =====
export const downloadAttachmentAPI = async (leadId) => {
  const response = await api.get(`/api/leads/${leadId}/attachment`, {
    responseType: 'blob',
  });
  return response;
};

// ===== Dashboard APIs (Protected) =====
export const getDashboardStatsAPI = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

// ===== Analytics APIs (Protected) =====
export const getStatusDistributionAPI = async () => {
  const response = await api.get('/api/analytics/status-distribution');
  return response.data;
};

export const getBudgetDistributionAPI = async () => {
  const response = await api.get('/api/analytics/budget-distribution');
  return response.data;
};

export const getLeadsOverTimeAPI = async (days = 30) => {
  const response = await api.get('/api/analytics/leads-over-time', {
    params: { days },
  });
  return response.data;
};

// ===== Export APIs (Protected) =====
export const exportLeadsAPI = async (format = 'csv', filters = {}) => {
  const response = await api.get('/api/leads/export', {
    params: { format, ...filters },
    responseType: 'blob',
  });

  // Trigger file download
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads_export.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ===== Admin User Management APIs (Protected — super_admin) =====
export const createAdminUserAPI = async (email, password, role) => {
  const response = await api.post('/api/admin/users', { email, password, role });
  return response.data;
};

export const getAdminUsersAPI = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const updateUserRoleAPI = async (userId, role) => {
  const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteAdminUserAPI = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export default api;
