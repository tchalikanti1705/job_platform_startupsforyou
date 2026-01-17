/**
 * Roles API - Job roles related API calls
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const rolesAPI = {
  /**
   * Create a new role
   * @param {Object} data - Role creation data
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.ROLES.BASE, data);
    return response.data;
  },
  
  /**
   * Get role by ID
   * @param {string} id - Role ID
   */
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.ROLES.DETAIL(id));
    return response.data;
  },
  
  /**
   * Update role
   * @param {string} id - Role ID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    const response = await apiClient.patch(ENDPOINTS.ROLES.DETAIL(id), data);
    return response.data;
  },
  
  /**
   * Delete/close role
   * @param {string} id - Role ID
   */
  delete: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.ROLES.DETAIL(id));
    return response.data;
  },
  
  /**
   * List roles with filters
   * @param {Object} params - Query parameters
   */
  list: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ROLES.BASE, { params });
    return response.data;
  },
  
  /**
   * Get recommended roles for engineer
   */
  getRecommended: async () => {
    const response = await apiClient.get(ENDPOINTS.ROLES.RECOMMENDED);
    return response.data;
  },
  
  /**
   * Get roles by startup
   * @param {string} startupId - Startup ID
   */
  getByStartup: async (startupId) => {
    const response = await apiClient.get(ENDPOINTS.ROLES.BY_STARTUP(startupId));
    return response.data;
  },
};
