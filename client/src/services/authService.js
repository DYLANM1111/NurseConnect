// src/services/authService.js
import api from './api';

// User authentication methods
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting user login with:', credentials);
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('User login error:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    console.log('Attempting user registration');
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('User registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response?.data || error.message);
    throw error;
  }
};


export const loginFacility = async (email, password) => {
  try {
    console.log('Attempting facility login with:', { email, password });
    // Make sure this endpoint is for facilities, not users
    const response = await api.post('/api/facility-auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Facility login error:', error.response?.data);
    throw error;
  }
};

export const registerFacility = async (facilityData) => {
  try {
    console.log('Attempting facility registration');
    const response = await api.post('/api/facility-auth/register', facilityData);
    return response.data;
  } catch (error) {
    console.error('Facility registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentFacility = async () => {
  try {
    const response = await api.get('/api/facility-auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current facility:', error.response?.data || error.message);
    throw error;
  }
};