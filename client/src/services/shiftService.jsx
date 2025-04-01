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
    console.log('Creating shift with data:', shiftData);
    const response = await api.post('/api/shifts', shiftData);
    console.log('Server response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in createShift service:', error);
    throw error;
  }
};

export const updateShift = async (id, shiftData) => {
  try {
    console.log('Updating shift ID', id, 'with data:', shiftData);
    const response = await api.put(`/api/shifts/${id}`, shiftData);
    console.log('Server response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in updateShift service:', error);
    throw error;
  }
};

export const deleteShift = async (id) => {
  const response = await api.delete(`/api/shifts/${id}`);
  return response.data;
};

export const getShiftsByFacility = async (facilityId) => {
  const response = await api.get(`/api/shifts/facility/${facilityId}`);
  return response.data;
};