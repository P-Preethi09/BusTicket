import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, userId, role } = response.data;
      
      const userData = { id: userId, username, role };
      setUser(userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => !!user;
  const hasRole = (role) => user && user.role === role;
  const isAdmin = () => hasRole('ADMIN');
  const isDriver = () => hasRole('DRIVER');

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isDriver,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};