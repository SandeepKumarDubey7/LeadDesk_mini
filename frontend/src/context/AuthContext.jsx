/**
 * Authentication Context for LeadDesk Mini.
 * Manages login state, JWT token storage, and provides auth utilities.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('leaddesk_token');
    const storedUser = localStorage.getItem('leaddesk_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginAPI(email, password);

    const userData = { email: data.email, role: data.role || 'admin' };

    localStorage.setItem('leaddesk_token', data.access_token);
    localStorage.setItem('leaddesk_user', JSON.stringify(userData));

    setToken(data.access_token);
    setUser(userData);

    toast.success(`Welcome back, ${data.email}!`);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('leaddesk_token');
    localStorage.removeItem('leaddesk_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    role: user?.role || 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
