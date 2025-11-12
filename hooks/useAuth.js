import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  refreshToken, 
  fetchUserProfile,
  initializeAuth,
  clearError 
} from '../store/slices/authSlice';

// Redux-based auth hook to replace AuthContext
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      // Trigger socket connection after successful login
      console.log('🔌 Triggering socket connection after login');
      dispatch({ type: 'socket/connect' });
      return result.payload.user;
    } else {
      throw new Error(result.payload || 'Login failed');
    }
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      // Trigger socket connection after successful registration
      console.log('🔌 Triggering socket connection after registration');
      dispatch({ type: 'socket/connect' });
      return result.payload.user;
    } else {
      throw new Error(result.payload || 'Registration failed');
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  const refresh = async () => {
    const result = await dispatch(refreshToken());
    if (refreshToken.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.payload || 'Token refresh failed');
    }
  };

  const fetchProfile = async () => {
    const result = await dispatch(fetchUserProfile());
    if (fetchUserProfile.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.payload || 'Failed to fetch profile');
    }
  };

  const initialize = async () => {
    await dispatch(initializeAuth());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    // State
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    initialized: auth.initialized,
    
    // Actions
    login,
    register,
    logout,
    refresh,
    fetchProfile,
    initialize,
    clearError: clearAuthError,
  };
};
