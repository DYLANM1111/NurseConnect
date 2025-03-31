import api from './api';

export const getAllFacilities = async () => {
  const response = await api.get('/api/facilities');
  return response.data;
};

export const getFacilityById = async (id) => {
  const response = await api.get(`/api/facilities/${id}`);
  return response.data;
};

export const createFacility = async (facilityData) => {
  const response = await api.post('/api/facilities', facilityData);
  return response.data;
};

export const updateFacility = async (id, facilityData) => {
  const response = await api.put(`/api/facilities/${id}`, facilityData);
  return response.data;
};

export const deleteFacility = async (id) => {
  const response = await api.delete(`/api/facilities/${id}`);
  return response.data;
};

export const searchFacilities = async (query) => {
  const response = await api.get(`/api/facilities/search?query=${query}`);
  return response.data;
};

export const loginFacility = async (email, password) => {
  try {
    const response = await api.post('/api/facility-auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Facility login error:', error);
    throw error;
  }
};

export const registerFacility = async (facilityData) => {
  try {
    const response = await api.post('/api/facility-auth/register', facilityData);
    return response.data;
  } catch (error) {
    console.error('Facility registration error:', error);
    throw error;
  }
};