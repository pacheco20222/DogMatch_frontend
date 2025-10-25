/**
 * Logger Utility
 * 
 * Wraps console methods to only log in development mode.
 * This prevents console logs from impacting performance in production.
 * 
 * Usage:
 * import { logger } from '../utils/logger';
 * logger.log('Debug message');
 * logger.error('Error message');
 * logger.warn('Warning message');
 */

export const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },
};

export default logger;
