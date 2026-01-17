/**
 * useNotifications - Notifications controller hook
 */
import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.BASE, {
        params: { unread_only: unreadOnly }
      });
      setNotifications(response.data || []);
      setUnreadCount(response.data.filter(n => !n.read).length);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (id) => {
    try {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      setNotifications(prev => prev.map(n => 
        n.notification_id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail };
    }
  }, []);
  
  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail };
    }
  }, []);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
