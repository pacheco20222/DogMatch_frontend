import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';
import { saveTokens, getTokens, clearTokens } from '../../auth/storage';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Map frontend field names to backend field names
      const loginData = {
        email: credentials.email,
        password: credentials.password,
        totp_token: credentials.twoFactorCode || null,
      };
      
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: loginData,
      });
      
      // Save tokens to storage
      await saveTokens({
        access: response.access_token,
        refresh: response.refresh_token,
      });
      
      return {
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Map frontend field names to backend field names
      const registrationData = {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        user_type: userData.user_type || 'owner',
        city: userData.city,
        state: userData.state,
        country: userData.country,
      };
      
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: registrationData,
      });
      
      // Save tokens to storage
      await saveTokens({
        access: response.access_token,
        refresh: response.refresh_token,
      });
      
      return {
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const { refresh: refreshToken } = await getTokens();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiFetch('/api/auth/refresh', {
        method: 'POST',
        body: {},
        token: refreshToken,
      });
      
      await saveTokens({ access: response.access_token });
      return response.access_token;
    } catch (error) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await apiFetch('/api/auth/me', {
        token: auth.accessToken,
      });
      
      return response.user || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { access } = await getTokens();
      if (access) {
        // Set the token in state
        dispatch(setTokens({ accessToken: access }));
        
        // Try to fetch user profile
        const result = await dispatch(fetchUserProfile());
        if (fetchUserProfile.fulfilled.match(result)) {
          // Trigger socket connection after successful auth
          console.log('🔌 Triggering socket connection after auth initialization');
          dispatch({ type: 'socket/connect' });
          
          return { accessToken: access, user: result.payload };
        } else {
          // If profile fetch fails, clear tokens
          await clearTokens();
          return { accessToken: null, user: null };
        }
      }
      return { accessToken: null, user: null };
    } catch (error) {
      await clearTokens();
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await clearTokens();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Fetch profile
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = !!(action.payload.user && action.payload.accessToken);
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.initialized = true;
        state.error = action.payload;
      });
  },
});

export const { clearError, setInitialized, updateUser, setTokens, setUser } = authSlice.actions;
export default authSlice.reducer;
