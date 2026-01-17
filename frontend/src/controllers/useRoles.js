/**
 * useRoles - Job roles controller hook
 */
import { useState, useCallback } from 'react';
import { rolesAPI } from '../api/roles';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [recommendedRoles, setRecommendedRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  });
  
  /**
   * Fetch roles with filters
   */
  const fetchRoles = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await rolesAPI.list(params);
      setRoles(data.roles || []);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        hasMore: data.has_more,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch roles');
      return { roles: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch recommended roles for engineer
   */
  const fetchRecommendedRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await rolesAPI.getRecommended();
      setRecommendedRoles(data.roles || data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch recommendations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get role by ID
   */
  const getRoleById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await rolesAPI.getById(id);
      setCurrentRole(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch role');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Create a new role
   */
  const createRole = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newRole = await rolesAPI.create(data);
      setRoles(prev => [newRole, ...prev]);
      return { success: true, role: newRole };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create role';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Update role
   */
  const updateRole = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await rolesAPI.update(id, data);
      setRoles(prev => prev.map(r => r.role_id === id ? updated : r));
      setCurrentRole(updated);
      return { success: true, role: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update role';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Delete/close role
   */
  const deleteRole = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await rolesAPI.delete(id);
      setRoles(prev => prev.filter(r => r.role_id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete role';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    roles,
    currentRole,
    recommendedRoles,
    isLoading,
    error,
    pagination,
    fetchRoles,
    fetchRecommendedRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
};
