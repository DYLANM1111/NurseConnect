// app/types/auth.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types and interfaces
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber?: string;
  state?: string;
  specialty?: string;
  role?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber?: string;
  state?: string;
  specialty?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
}

// Storage key constants
export const TOKEN_KEY = '@auth_token';
export const REFRESH_TOKEN_KEY = '@refresh_token';
export const USER_KEY = '@user_data';

// API URL - Replace with your actual API URL
export const API_URL = 'https://your-api-domain.com/api';

// Create an Axios instance for API requests
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add JWT token to requests
  client.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh on 401 errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // If 401 (Unauthorized) and not already retrying
      if (
        error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url !== '/auth/login' && 
        originalRequest.url !== '/auth/refresh'
      ) {
        originalRequest._retry = true;
        
        try {
          // Get refresh token
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          
          if (!refreshToken) {
            // No refresh token available, logout user
            await handleLogout();
            return Promise.reject(error);
          }
          
          // Request new token with refresh token
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data;
          
          // Save new token
          await AsyncStorage.setItem(TOKEN_KEY, token);
          
          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          } else {
            originalRequest.headers = { Authorization: `Bearer ${token}` };
          }
          
          // Retry the original request
          return client(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout
          await handleLogout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create a singleton instance of apiClient
export const apiClient = createApiClient();

// Authentication helper functions
export const handleLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    // Store tokens and user data
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw new Error(JSON.stringify(axiosError.response.data));
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const handleRegister = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    const { token, refreshToken, user } = response.data;
    
    // Store tokens and user data
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      throw new Error(JSON.stringify(axiosError.response.data));
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const handleLogout = async (): Promise<void> => {
  try {
    // Call logout endpoint (optional)
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore errors from logout endpoint
      }
    }
    
    // Clear tokens and user data
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    // Still attempt to remove tokens even if API call fails
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  }
};

export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userData = await AsyncStorage.getItem(USER_KEY);
    
    if (!token || !userData) {
      return null;
    }
    
    // Verify token is still valid with a simple request
    try {
      await apiClient.get('/auth/me');
    } catch (error) {
      // Token invalid, clear auth data
      await handleLogout();
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Auth status check error:', error);
    return null;
  }
};

export const isUserAuthenticated = async (): Promise<boolean> => {
  const user = await checkAuthStatus();
  return user !== null;
};