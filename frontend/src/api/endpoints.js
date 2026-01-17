/**
 * API Endpoints - Centralized endpoint definitions
 */

export const ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  
  // Startups
  STARTUPS: {
    BASE: '/api/startups',
    DETAIL: (id) => `/api/startups/${id}`,
    MY_STARTUP: '/api/startups/me',
  },
  
  // Roles
  ROLES: {
    BASE: '/api/roles',
    DETAIL: (id) => `/api/roles/${id}`,
    BY_STARTUP: (startupId) => `/api/startups/${startupId}/roles`,
    RECOMMENDED: '/api/roles/recommended',
  },
  
  // Engineers
  ENGINEERS: {
    BASE: '/api/engineers',
    DETAIL: (id) => `/api/engineers/${id}`,
    MY_PROFILE: '/api/engineers/me',
    SEARCH: '/api/engineers/search',
  },
  
  // Applications
  APPLICATIONS: {
    BASE: '/api/applications',
    DETAIL: (id) => `/api/applications/${id}`,
    MY_APPLICATIONS: '/api/applications/me',
    BY_ROLE: (roleId) => `/api/roles/${roleId}/applications`,
  },
  
  // Connections
  CONNECTIONS: {
    BASE: '/api/connections',
    DETAIL: (id) => `/api/connections/${id}`,
    MESSAGES: (id) => `/api/connections/${id}/messages`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
  },
  
  // Resume
  RESUME: {
    UPLOAD: '/api/resume/upload',
    PARSE: '/api/resume/parse',
    DOWNLOAD: (id) => `/api/resume/${id}`,
  },
  
  // Matching
  MATCHING: {
    CANDIDATES: (roleId) => `/api/matching/candidates/${roleId}`,
    ROLES: '/api/matching/roles',
  },
};
