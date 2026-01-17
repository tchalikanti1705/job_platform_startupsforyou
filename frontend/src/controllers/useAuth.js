/**
 * useAuth - Authentication controller hook
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading,
    setUser, 
    setToken,
    login: storeLogin,
    signup: storeSignup,
    logout: storeLogout,
    checkAuth: storeCheckAuth
  } = useAuthStore();
  
  const [error, setError] = useState(null);
  
  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    const result = await storeLogin(email, password);
    
    if (result.success) {
      // Navigate based on role
      if (result.user.role === 'founder') {
        navigate('/founder/dashboard');
      } else {
        navigate('/engineer/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    return result;
  }, [storeLogin, navigate]);
  
  /**
   * Signup user
   */
  const signup = useCallback(async (name, email, password, role) => {
    setError(null);
    const result = await storeSignup(name, email, password, role);
    
    if (result.success) {
      // Navigate to onboarding
      if (role === 'founder') {
        navigate('/founder/onboarding');
      } else {
        navigate('/engineer/onboarding');
      }
    } else {
      setError(result.error);
    }
    
    return result;
  }, [storeSignup, navigate]);
  
  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    await storeLogout();
    navigate('/');
  }, [storeLogout, navigate]);
  
  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    return await storeCheckAuth();
  }, [storeCheckAuth]);
  
  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);
  
  /**
   * Check if onboarding is completed
   */
  const isOnboarded = useCallback(() => {
    return user?.onboarding_completed === true;
  }, [user]);
  
  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    hasRole,
    isOnboarded,
    isFounder: user?.role === 'founder',
    isEngineer: user?.role === 'engineer',
  };
};
