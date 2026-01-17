/**
 * useApplications - Applications controller hook
 */
import { useState, useCallback } from 'react';
import { applicationsAPI } from '../api/applications';

export const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  });
  
  /**
   * Apply to a role
   */
  const applyToRole = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const application = await applicationsAPI.create(data);
      setApplications(prev => [application, ...prev]);
      return { success: true, application };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to submit application';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch my applications (engineer)
   */
  const fetchMyApplications = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await applicationsAPI.getMyApplications(params);
      setApplications(data.applications || []);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        hasMore: data.has_more,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch applications');
      return { applications: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch applications for a role (founder)
   */
  const fetchRoleApplications = useCallback(async (roleId, params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await applicationsAPI.getByRole(roleId, params);
      setApplications(data.applications || []);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        hasMore: data.has_more,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch applications');
      return { applications: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Update application status (founder)
   */
  const updateApplicationStatus = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await applicationsAPI.updateStatus(id, data);
      setApplications(prev => prev.map(a => 
        a.application_id === id ? updated : a
      ));
      setCurrentApplication(updated);
      return { success: true, application: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update application';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Withdraw application (engineer)
   */
  const withdrawApplication = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await applicationsAPI.withdraw(id);
      setApplications(prev => prev.map(a => 
        a.application_id === id ? { ...a, status: 'withdrawn' } : a
      ));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to withdraw application';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get application by ID
   */
  const getApplicationById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await applicationsAPI.getById(id);
      setCurrentApplication(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch application');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    applications,
    currentApplication,
    isLoading,
    error,
    pagination,
    applyToRole,
    fetchMyApplications,
    fetchRoleApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationById,
  };
};
