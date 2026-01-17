/**
 * useEngineer - Engineer profile controller hook
 */
import { useState, useCallback } from 'react';
import { engineersAPI } from '../api/engineers';

export const useEngineer = () => {
  const [profile, setProfile] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  });
  
  /**
   * Fetch my engineer profile
   */
  const fetchMyProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await engineersAPI.getMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to fetch profile');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Update engineer profile
   */
  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await engineersAPI.updateProfile(data);
      setProfile(updated);
      return { success: true, profile: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await engineersAPI.completeOnboarding(data);
      setProfile(updated);
      return { success: true, profile: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to complete onboarding';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * List engineers (for founders)
   */
  const fetchEngineers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await engineersAPI.list(params);
      setEngineers(data.engineers || []);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        hasMore: data.has_more,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch engineers');
      return { engineers: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Search engineers by skills
   */
  const searchEngineers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await engineersAPI.search(params);
      setEngineers(data.engineers || data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search engineers');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get engineer by ID
   */
  const getEngineerById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await engineersAPI.getById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch engineer');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    profile,
    engineers,
    isLoading,
    error,
    pagination,
    fetchMyProfile,
    updateProfile,
    completeOnboarding,
    fetchEngineers,
    searchEngineers,
    getEngineerById,
  };
};
