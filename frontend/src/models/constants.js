/**
 * Models - TypeScript-like type definitions and data structures
 * These are used for documentation and consistency
 */

// User roles
export const USER_ROLES = {
  FOUNDER: 'founder',
  ENGINEER: 'engineer',
};

// Application statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Connection statuses
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

// Availability status for engineers
export const AVAILABILITY_STATUS = {
  ACTIVELY_LOOKING: 'actively_looking',
  OPEN_TO_OPPORTUNITIES: 'open_to_opportunities',
  NOT_LOOKING: 'not_looking',
};

// Work preferences
export const WORK_PREFERENCE = {
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  ONSITE: 'onsite',
  ANY: 'any',
};

// Experience levels
export const EXPERIENCE_LEVEL = {
  INTERN: 'intern',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  PRINCIPAL: 'principal',
};

// Funding stages
export const FUNDING_STAGE = {
  PRE_SEED: 'pre_seed',
  SEED: 'seed',
  SERIES_A: 'series_a',
  SERIES_B: 'series_b',
  SERIES_C: 'series_c',
  SERIES_D_PLUS: 'series_d_plus',
  BOOTSTRAPPED: 'bootstrapped',
};

// Team sizes
export const TEAM_SIZE = {
  SOLO: '1',
  SMALL: '2-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  ENTERPRISE: '200+',
};

// Employment types
export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
};
