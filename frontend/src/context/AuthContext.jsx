import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize axios interceptor to set auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  // Load user data on mount (verify token is still valid)
  const loadUser = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Error loading user:', error.message);
      // Token invalid or expired; clear auth state
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Register user with validation
  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      // Basic frontend validation
      if (!name?.trim() || !email?.trim() || !password) {
        return { success: false, message: 'All fields are required' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      const res = await axios.post('/api/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message 
        || (Array.isArray(err.response?.data?.errors) 
          ? err.response.data.errors.map(e => e.msg).join(', ')
          : 'Registration failed');
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Login user with validation
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      if (!email?.trim() || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const res = await axios.post('/api/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message 
        || (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.map(e => e.msg).join(', ')
          : 'Login failed');
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Logout user and clear all auth state
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
