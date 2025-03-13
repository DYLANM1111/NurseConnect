// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiBaseUrl, initApiConfig } from './config';

// Initialize API config on import
initApiConfig();

// Create axios instance with dynamic base URL
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Update baseURL before each request
apiClient.interceptors.request.use(async (config) => {
  config.baseURL = apiBaseUrl;
  return config;
});

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      console.log('Making registration request to:', apiBaseUrl + '/auth/register');
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error.response?.data?.error || 'Registration failed. Please try again.';
    }
  },
  
  // Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Store user data in AsyncStorage
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data?.error || 'Login failed. Please check your credentials.';
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw 'Logout failed';
    }
  },
  
  // Get current user from storage
  getCurrentUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};

// Shifts API
export const shiftsAPI = {
  // Get all shifts
  getShifts: async () => {
    try {
      const response = await apiClient.get('/shifts');
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw error.response?.data?.error || 'Failed to fetch shifts';
    }
  },
  
  // Get shift details by ID
  getShiftDetails: async (id) => {
    try {
      const response = await apiClient.get(`/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift details:', error);
      throw error.response?.data?.error || 'Failed to fetch shift details';
    }
  },
  
  // Apply for a shift
  applyForShift: async (shiftId, applicationData) => {
    try {
      const response = await apiClient.post(`/shifts/${shiftId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for shift:', error);
      throw error.response?.data?.error || 'Failed to apply for shift';
    }
  }
};

export default apiClient;