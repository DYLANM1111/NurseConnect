// app/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, isAuthenticated, getCurrentUser } from '../api/auth';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await isAuthenticated();
        
        if (authenticated) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const handleLogin = async (email: string, password :string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user } = await login(email, password);
      setUser(user);
      return user;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user } = await register(userData);
      setUser(user);
      return user;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await logout();
      setUser(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};