import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';

// Async thunks
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: profileData,
        token: auth.accessToken,
      });
      
      return response.user || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/users/change-password', {
        method: 'PUT',
        body: passwordData,
        token: auth.accessToken,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'user/uploadPhoto',
  async (photoData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        type: photoData.type || 'image/jpeg',
        name: photoData.name || 'profile.jpg',
      });
      
      const response = await apiFetch('/api/users/profile/photo', {
        method: 'POST',
        body: formData,
        token: auth.accessToken,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.user || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload photo');
    }
  }
);

export const deactivateAccount = createAsyncThunk(
  'user/deactivate',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/users/deactivate', {
        method: 'PUT',
        token: auth.accessToken,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to deactivate account');
    }
  }
);

export const reactivateAccount = createAsyncThunk(
  'user/reactivate',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/users/reactivate', {
        method: 'PUT',
        token: auth.accessToken,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reactivate account');
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  loading: false,
  error: null,
  uploadProgress: 0,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload photo
    builder
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.uploadProgress = 100;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });

    // Deactivate account
    builder
      .addCase(deactivateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deactivateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reactivate account
    builder
      .addCase(reactivateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivateAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(reactivateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUploadProgress, clearUploadProgress } = userSlice.actions;
export default userSlice.reducer;
