/**
 * Engineers API - Engineer profiles related API calls
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const engineersAPI = {
  /**
   * Get engineer profile by ID
   * @param {string} id - Engineer profile ID
   */
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.ENGINEERS.DETAIL(id));
    return response.data;
  },
  
  /**
   * Get current user's engineer profile
   */
  getMyProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.ENGINEERS.MY_PROFILE);
    return response.data;
  },
  
  /**
   * Update engineer profile
   * @param {Object} data - Update data
   */
  updateProfile: async (data) => {
    const response = await apiClient.patch(ENDPOINTS.ENGINEERS.MY_PROFILE, data);
    return response.data;
  },
  
  /**
   * Complete onboarding with full profile
   * @param {Object} data - Full profile data
   */
  completeOnboarding: async (data) => {
    const response = await apiClient.post(`${ENDPOINTS.ENGINEERS.MY_PROFILE}/onboarding`, data);
    return response.data;
  },
  
  /**
   * List engineers with filters (for founders)
   * @param {Object} params - Query parameters
   */
  list: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ENGINEERS.BASE, { params });
    return response.data;
  },
  
  /**
   * Search engineers by skills
   * @param {Object} params - Search parameters
   */
  search: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ENGINEERS.SEARCH, { params });
    return response.data;
  },
};
