// api/config.js
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network'; // Add this import

// API URL configuration
const PORT = '5001';
const API_PATH = '/api';

// Define getDevServerIp outside of getApiUrl
const getDevServerIp = async () => {
  try {
    // For iOS simulator and Android emulator, you might need different approaches
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const ip = await Network.getIpAddressAsync();
      return ip;
    }
    return '127.0.0.1'; // Fallback to localhost
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return '127.0.0.1'; // Fallback to localhost
  }
};

// Function to get the appropriate base URL
export const getApiUrl = async () => {
  try {
    // Get network info
    const netInfo = await NetInfo.fetch();
    
    // Default to localhost for simulators
    let baseUrl = `http://localhost:${PORT}${API_PATH}`;
    
    // For iOS simulators, localhost works fine
    if (Platform.OS === 'ios' && !Platform.isPad && !netInfo.isConnected) {
      return baseUrl;
    }
    
    // For Android emulators, use 10.0.2.2 (special alias to host loopback)
    if (Platform.OS === 'android' && !netInfo.isConnected) {
      baseUrl = `http://10.0.2.2:${PORT}${API_PATH}`;
      return baseUrl;
    }
    
    // For physical devices or when we can't determine, use development server IP
    const devServerIp = await getDevServerIp();
    baseUrl = `http://${devServerIp}:${PORT}${API_PATH}`;
    
    return baseUrl;
  } catch (error) {
    console.error('Error determining API URL:', error);
    // Fallback to a default with your actual IP
    return `http://10.122.150.98:${PORT}${API_PATH}`;
  }
};

// Export a pre-configured base URL for immediate use
export let apiBaseUrl = `http://10.122.150.98:${PORT}${API_PATH}`;

export const initApiConfig = async () => {
  apiBaseUrl = await getApiUrl();
  console.log('API URL configured:', apiBaseUrl);
  return apiBaseUrl;
};

export default {
  getApiUrl,
  initApiConfig,
  apiBaseUrl
};