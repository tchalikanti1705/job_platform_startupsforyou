/**
 * useStartup - Startup management controller hook
 */
import { useState, useCallback, useEffect } from 'react';
import { startupsAPI } from '../api/startups';

export const useStartup = () => {
  const [startup, setStartup] = useState(null);
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch founder's startup
   */
  const fetchMyStartup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await startupsAPI.getMyStartup();
      setStartup(data);
      return data;
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to fetch startup');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Create a new startup
   */
  const createStartup = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStartup = await startupsAPI.create(data);
      setStartup(newStartup);
      return { success: true, startup: newStartup };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create startup';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Update startup
   */
  const updateStartup = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await startupsAPI.update(id, data);
      setStartup(updated);
      return { success: true, startup: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update startup';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch startups list with filters
   */
  const fetchStartups = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await startupsAPI.list(params);
      setStartups(data.startups || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch startups');
      return { startups: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get startup by ID
   */
  const getStartupById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await startupsAPI.getById(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch startup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    startup,
    startups,
    isLoading,
    error,
    fetchMyStartup,
    createStartup,
    updateStartup,
    fetchStartups,
    getStartupById,
  };
};
