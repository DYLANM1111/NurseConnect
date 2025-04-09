// api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiBaseUrl, initApiConfig } from './config';

// Initialize API config on import
initApiConfig();

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = apiBaseUrl;
  
  if (config.url && !config.url.startsWith('/')) {
    config.url = '/' + config.url;
  }
  
  const fullUrl = `${apiBaseUrl}${config.url}`;
  console.log(`Making API request to: ${fullUrl}`);
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
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
  //Nurse Details 
  nurseDetails : async(userId)=>{
try{
  const response = await apiClient.get(`nurses/${userId}/profile`);
  return response.data;
} catch (error) {
  console.error('Error fetching nurse profile:', error);
  throw error.response?.data?.error || 'Failed to fetch nurse profile';
}
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw 'Logout failed';
    }
  },
  
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

export const shiftsAPI = {
  getShifts: async () => {
    try {
      console.log('Fetching all shifts');
      const response = await apiClient.get('shifts');
      console.log(`Successfully fetched ${response.data?.length || 0} shifts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shifts:', error);
      
      // Detailed error logging
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error configuring request:', error.message);
      }
      
      throw error.response?.data?.error || 'Failed to fetch shifts';
    }
  },
  
  getShiftDetails: async (id) => {
    try {
      console.log(`Fetching shift details for ID: ${id}`);
      const response = await apiClient.get(`shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift details:', error);
      // Detailed error logging
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error configuring request:', error.message);
      }
      
      if (error.response?.status === 404) {
        throw 'Shift not found - it may have been filled or removed';
      }
      
      throw error.response?.data?.error || 'Failed to fetch shift details';
    }
  },
  
  applyForShift: async (shiftId, applicationData) => {
    try {
      const user = await authAPI.getCurrentUser();
      
      if (!user || !user.nurse_profile_id) {
        throw 'User profile not found or incomplete. Please update your profile.';
      }
      
      const completeApplicationData = {
        ...applicationData,
        nurse_profile_id: user.nurse_profile_id
      };
      
      console.log('Submitting application with data:', completeApplicationData);
      
      const response = await apiClient.post(`shifts/${shiftId}/apply`, completeApplicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying for shift:', error);
      throw error.response?.data?.error || 'Failed to apply for shift';
    }
  }
};

export const dashboardAPI = {
  getUserEarnings: async (userId) => {
    try {
      const response = await apiClient.get(`users/${userId}/earnings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      }
      
      throw error.response?.data?.error || 'Failed to fetch earnings data';
    }
  },
  
  getUpcomingShift: async (userId) => {
    try {
      const response = await apiClient.get(`users/${userId}/shifts/upcoming`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming shift:', error);
      
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      }
      
      // Return null if no shifts found (404)
      if (error.response?.status === 404) {
        return null;
      }
      
      throw error.response?.data?.error || 'Failed to fetch upcoming shift data';
    }
  },
  
  getCompletedShifts: async (userId) => {
    try {
      const response = await apiClient.get(`users/${userId}/shifts/completed`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed shifts:', error);
      
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      }
      
      // Return empty array if no shifts found (404)
      if (error.response?.status === 404) {
        return [];
      }
      
      throw error.response?.data?.error || 'Failed to fetch completed shifts data';
    }
  }
  
};
// Add this to your client.js file

export const applicationsAPI = {
  // Get all applications for a nurse
  getNurseApplications: async (nurseId) => {
    try {
      const response = await apiClient.get(`/nurses/${nurseId}/applications`);

      return response.data;
    } catch (error) {
      console.error('Error fetching nurse applications:', error);
      
      if (error.response && error.response.status === 404) {
        return []; 
      }
      
      throw error.response?.data?.error || 'Failed to fetch applications';
    }
  },
  
  // Withdraw an application
  withdrawApplication: async (applicationId, nurseId) => {
    try {
      const response = await apiClient.post(`/applications/${applicationId}/withdraw`, { nurseId });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error.response?.data?.error || 'Failed to withdraw application';
    }
  },
  
  // Get application details
  getApplicationDetails: async (applicationId) => {
    try {
      const response = await apiClient.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error.response?.data?.error || 'Failed to fetch application details';
    }
  }
};

export default apiClient;