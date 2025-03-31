import api from './api';

export const getAllShifts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.facility_id) queryParams.append('facility_id', filters.facility_id);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/shifts?${queryString}` : '/api/shifts';
  
  const response = await api.get(url);
  return response.data;
};

export const getShiftById = async (id) => {
  const response = await api.get(`/api/shifts/${id}`);
  return response.data;
};

export const createShift = async (shiftData) => {
  try {
    console.log('Attempting to create shift:', shiftData);
    const response = await api.post('/api/shifts', shiftData);
    console.log('Shift created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating shift:', error);
    
    // Better error handling to extract more specific error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Throw a more informative error message
      throw {
        status: error.response.status,
        message: error.response.data.error || 'Server returned an error',
        errors: error.response.data.errors || []
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      throw {
        message: error.message || 'Error setting up the request'
      };
    }
  }
};

export const updateShift = async (id, shiftData) => {
  try {
    const response = await api.put(`/api/shifts/${id}`, shiftData);
    return response.data;
  } catch (error) {
    console.error('Error updating shift:', error);
    
    // Similar improved error handling as in createShift
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.error || 'Server returned an error',
        errors: error.response.data.errors || []
      };
    } else if (error.request) {
      throw {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      throw {
        message: error.message || 'Error setting up the request'
      };
    }
  }
};

export const deleteShift = async (id) => {
  try {
    const response = await api.delete(`/api/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shift:', error);
    
    // Similar improved error handling
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.error || 'Server returned an error',
        errors: error.response.data.errors || []
      };
    } else if (error.request) {
      throw {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      throw {
        message: error.message || 'Error setting up the request'
      };
    }
  }
};

export const getShiftsByFacility = async (facilityId) => {
  try {
    const response = await api.get(`/api/shifts/facility/${facilityId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting shifts by facility:', error);
    
    // Similar improved error handling
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.error || 'Server returned an error',
        errors: error.response.data.errors || []
      };
    } else if (error.request) {
      throw {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      throw {
        message: error.message || 'Error setting up the request'
      };
    }
  }
};