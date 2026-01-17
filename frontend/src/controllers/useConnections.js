/**
 * useConnections - Connections controller hook
 */
import { useState, useCallback } from 'react';
import { connectionsAPI } from '../api/connections';

export const useConnections = () => {
  const [connections, setConnections] = useState([]);
  const [currentConnection, setCurrentConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasMore: false,
  });
  
  /**
   * Create connection request (founder to engineer)
   */
  const createConnection = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connection = await connectionsAPI.create(data);
      setConnections(prev => [connection, ...prev]);
      return { success: true, connection };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to send connection request';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch my connections
   */
  const fetchConnections = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await connectionsAPI.getMyConnections(params);
      setConnections(data.connections || []);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        hasMore: data.has_more,
      });
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch connections');
      return { connections: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Respond to connection (engineer)
   */
  const respondToConnection = useCallback(async (id, accept, message = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await connectionsAPI.respond(id, { accept, message });
      setConnections(prev => prev.map(c => 
        c.connection_id === id ? updated : c
      ));
      setCurrentConnection(updated);
      return { success: true, connection: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to respond to connection';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Send message in connection
   */
  const sendMessage = useCallback(async (connectionId, content) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updated = await connectionsAPI.sendMessage(connectionId, { content });
      setCurrentConnection(updated);
      return { success: true, connection: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to send message';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Get connection by ID
   */
  const getConnectionById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await connectionsAPI.getById(id);
      setCurrentConnection(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch connection');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    connections,
    currentConnection,
    isLoading,
    error,
    pagination,
    createConnection,
    fetchConnections,
    respondToConnection,
    sendMessage,
    getConnectionById,
  };
};
