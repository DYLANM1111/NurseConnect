// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // User states
  const [currentUser, setCurrentUser] = useState(null);
  // Facility states
  const [currentFacility, setCurrentFacility] = useState(null);
  // Shared states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwt_decode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired, logout
            logout();
          } else {
            // Check if we have stored facility data
            const storedFacility = localStorage.getItem('facility');
            if (storedFacility) {
              setCurrentFacility(JSON.parse(storedFacility));
            } else {
              // Try to get user data if not facility
              try {
                const userData = await getCurrentUser();
                setCurrentUser(userData.user);
              } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
              }
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // User authentication methods
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await loginUser({ email, password });
      
      // Save token and set current user
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      
      return { success: true, user: response.user };
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await registerUser(userData);
      
      // Save token and set current user
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      
      return { success: true, user: response.user };
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  // Facility authentication methods
  const loginFacility = async (email, password) => {
    try {
      setError(null);
      // Make sure this calls the facility-auth endpoint
      const response = await axios.post('http://localhost:8080/api/facility-auth/login', { email, password });

      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('facility', JSON.stringify(response.data.facility));
      setCurrentFacility(response.data.facility);
      
      return { success: true, facility: response.data.facility };
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const registerFacility = async (facilityData) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:8080/api/facility-auth/register', facilityData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('facility', JSON.stringify(response.data.facility));
      setCurrentFacility(response.data.facility);
      
      return { success: true, facility: response.data.facility };
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  // Shared methods
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('facility');
    setCurrentUser(null);
    setCurrentFacility(null);
    navigate('/login');
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    currentFacility,
    loading,
    error,
    login,
    register,
    loginFacility,
    registerFacility,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};