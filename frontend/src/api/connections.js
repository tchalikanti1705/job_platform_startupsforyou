/**
 * Connections API - Founder-Engineer connections and messaging
 */
import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const connectionsAPI = {
  /**
   * Create a connection request (founder to engineer)
   * @param {Object} data - { engineer_id, role_id, message }
   */
  create: async (data) => {
    const response = await apiClient.post(ENDPOINTS.CONNECTIONS.BASE, data);
    return response.data;
  },
  
  /**
   * Get connection by ID
   * @param {string} id - Connection ID
   */
  getById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.CONNECTIONS.DETAIL(id));
    return response.data;
  },
  
  /**
   * Get my connections
   * @param {Object} params - Query parameters
   */
  getMyConnections: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.CONNECTIONS.BASE, { params });
    return response.data;
  },
  
  /**
   * Respond to connection request (engineer)
   * @param {string} id - Connection ID
   * @param {Object} data - { accept: boolean, message }
   */
  respond: async (id, data) => {
    const response = await apiClient.post(`${ENDPOINTS.CONNECTIONS.DETAIL(id)}/respond`, data);
    return response.data;
  },
  
  /**
   * Send message in connection
   * @param {string} id - Connection ID
   * @param {Object} data - { content }
   */
  sendMessage: async (id, data) => {
    const response = await apiClient.post(ENDPOINTS.CONNECTIONS.MESSAGES(id), data);
    return response.data;
  },
  
  /**
   * Get messages for a connection
   * @param {string} id - Connection ID
   */
  getMessages: async (id) => {
    const response = await apiClient.get(ENDPOINTS.CONNECTIONS.MESSAGES(id));
    return response.data;
  },
};
