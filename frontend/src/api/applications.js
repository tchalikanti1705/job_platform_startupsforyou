/**
 * Applications API - Job applications related API calls
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const applicationsAPI = {
  /**
   * Create a new application
   * @param {Object} data - { role_id, cover_letter, resume_url }
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.APPLICATIONS.BASE, data);
    return response.data;
  },
  
  /**
   * Get application by ID
   * @param {string} id - Application ID
   */
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.APPLICATIONS.DETAIL(id));
    return response.data;
  },
  
  /**
   * Get my applications (for engineers)
   * @param {Object} params - Query parameters
   */
  getMyApplications: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.APPLICATIONS.MY_APPLICATIONS, { params });
    return response.data;
  },
  
  /**
   * Get applications for a role (for founders)
   * @param {string} roleId - Role ID
   * @param {Object} params - Query parameters
   */
  getByRole: async (roleId, params = {}) => {
    const response = await apiClient.get(ENDPOINTS.APPLICATIONS.BY_ROLE(roleId), { params });
    return response.data;
  },
  
  /**
   * Update application status (for founders)
   * @param {string} id - Application ID
   * @param {Object} data - { status, feedback, interview_date }
   */
  updateStatus: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.APPLICATIONS.DETAIL(id), data);
    return response.data;
  },
  
  /**
   * Withdraw application (for engineers)
   * @param {string} id - Application ID
   */
  withdraw: async (id) => {
    const response = await apiClient.post(`${ENDPOINTS.APPLICATIONS.DETAIL(id)}/withdraw`);
    return response.data;
  },
};
