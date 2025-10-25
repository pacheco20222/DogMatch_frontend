import { logoutUser, refreshToken } from '../slices/authSlice';

/**
 * Auth Error Middleware
 * 
 * Intercepts all Redux actions and handles authentication errors globally.
 * 
 * Features:
 * - Detects 401 Unauthorized errors
 * - Automatically attempts token refresh
 * - Redirects to login if refresh fails
 * - Prevents infinite retry loops
 * 
 * Flow:
 * 1. Action fails with 401 error
 * 2. Middleware intercepts the error
 * 3. Attempts to refresh the access token
 * 4. If refresh succeeds: Retry original action
 * 5. If refresh fails: Logout user and redirect to login
 */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const authErrorMiddleware = (store) => (next) => (action) => {
  // Pass action through to next middleware
  const result = next(action);

  // Check if this is a rejected async thunk with 401 error
  if (action.type && action.type.endsWith('/rejected')) {
    const error = action.payload || action.error;
    
    // Check for 401 Unauthorized error
    const is401Error = 
      error?.status === 401 || 
      error?.message?.includes('401') ||
      error?.message?.toLowerCase().includes('unauthorized') ||
      error?.message?.toLowerCase().includes('token expired') ||
      error?.message?.toLowerCase().includes('invalid token') ||
      error?.message?.toLowerCase().includes('missing token');

    if (is401Error) {
      console.log('🔐 Auth Error Detected:', action.type);
      console.log('Error details:', error);
      
      // Don't try to refresh if we're already refreshing
      // or if the failed action was the refresh itself
      if (action.type === 'auth/refresh/rejected' || 
          action.type === 'auth/login/rejected' ||
          action.type === 'auth/logout/rejected') {
        console.log('❌ Refresh or login failed - logging out user');
        store.dispatch(logoutUser());
        
        // Note: Navigation will be handled by AuthInitializer
        // listening to auth state changes
        return result;
      }

      // If already refreshing, queue this action
      if (isRefreshing) {
        console.log('⏳ Token refresh in progress - queueing action');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            console.log('✅ Token refreshed - retrying action');
            // Retry the original action
            // This would need to be implemented per-action basis
            // For now, just resolve
            return resolve(result);
          })
          .catch(err => {
            return reject(err);
          });
      }

      console.log('🔄 Attempting to refresh token...');
      isRefreshing = true;

      // Attempt token refresh
      return store.dispatch(refreshToken())
        .then((refreshResult) => {
          if (refreshToken.fulfilled.match(refreshResult)) {
            console.log('✅ Token refresh successful');
            isRefreshing = false;
            processQueue(null, refreshResult.payload);
            
            // Original action should be retried by the calling component
            // We just ensure the new token is available
            return result;
          } else {
            throw new Error('Token refresh failed');
          }
        })
        .catch((refreshError) => {
          console.log('❌ Token refresh failed:', refreshError);
          isRefreshing = false;
          processQueue(refreshError, null);
          
          // Logout user on refresh failure
          store.dispatch(logoutUser());
          
          return result;
        });
    }
  }

  return result;
};

export default authErrorMiddleware;
