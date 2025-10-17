import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';

// Async thunks
export const fetchMyDogs = createAsyncThunk(
  'dogs/fetchMyDogs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/dogs/my-dogs', {
        token: auth.accessToken,
      });
      
      return response.dogs || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dogs');
    }
  }
);

export const fetchDiscoverDogs = createAsyncThunk(
  'dogs/fetchDiscover',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/dogs/discover', {
        token: auth.accessToken,
      });
      
      return response.dogs || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch discover dogs');
    }
  }
);

export const createDog = createAsyncThunk(
  'dogs/create',
  async (dogData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/dogs', {
        method: 'POST',
        body: dogData,
        token: auth.accessToken,
      });
      
      return response.dog || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create dog');
    }
  }
);

export const updateDog = createAsyncThunk(
  'dogs/update',
  async ({ id, dogData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/dogs/${id}`, {
        method: 'PUT',
        body: dogData,
        token: auth.accessToken,
      });
      
      return response.dog || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update dog');
    }
  }
);

export const deleteDog = createAsyncThunk(
  'dogs/delete',
  async (dogId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/dogs/${dogId}`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      
      return dogId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete dog');
    }
  }
);

export const uploadDogPhoto = createAsyncThunk(
  'dogs/uploadPhoto',
  async ({ dogId, photoData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        type: photoData.type || 'image/jpeg',
        name: photoData.name || 'dog.jpg',
      });
      
      const response = await apiFetch(`/api/dogs/${dogId}/photos`, {
        method: 'POST',
        body: formData,
        token: auth.accessToken,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { dogId, photo: response.photo || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload photo');
    }
  }
);

export const deleteDogPhoto = createAsyncThunk(
  'dogs/deletePhoto',
  async ({ dogId, photoId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/dogs/${dogId}/photos/${photoId}`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      
      return { dogId, photoId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete photo');
    }
  }
);

// Initial state
const initialState = {
  myDogs: [],
  discoverDogs: [],
  loading: false,
  discoverLoading: false,
  error: null,
  uploadProgress: 0,
  lastFetch: null,
};

// Dogs slice
const dogsSlice = createSlice({
  name: 'dogs',
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
    removeFromDiscover: (state, action) => {
      state.discoverDogs = state.discoverDogs.filter(dog => dog.id !== action.payload);
    },
    clearDiscoverDogs: (state) => {
      state.discoverDogs = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch my dogs
    builder
      .addCase(fetchMyDogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDogs.fulfilled, (state, action) => {
        state.loading = false;
        state.myDogs = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchMyDogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch discover dogs
    builder
      .addCase(fetchDiscoverDogs.pending, (state) => {
        state.discoverLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscoverDogs.fulfilled, (state, action) => {
        state.discoverLoading = false;
        state.discoverDogs = action.payload;
        state.error = null;
      })
      .addCase(fetchDiscoverDogs.rejected, (state, action) => {
        state.discoverLoading = false;
        state.error = action.payload;
      });

    // Create dog
    builder
      .addCase(createDog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDog.fulfilled, (state, action) => {
        state.loading = false;
        state.myDogs.push(action.payload);
        state.error = null;
      })
      .addCase(createDog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update dog
    builder
      .addCase(updateDog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myDogs.findIndex(dog => dog.id === action.payload.id);
        if (index !== -1) {
          state.myDogs[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete dog
    builder
      .addCase(deleteDog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDog.fulfilled, (state, action) => {
        state.loading = false;
        state.myDogs = state.myDogs.filter(dog => dog.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload photo
    builder
      .addCase(uploadDogPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDogPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        const { dogId, photo } = action.payload;
        const dogIndex = state.myDogs.findIndex(dog => dog.id === dogId);
        if (dogIndex !== -1) {
          if (!state.myDogs[dogIndex].photos) {
            state.myDogs[dogIndex].photos = [];
          }
          state.myDogs[dogIndex].photos.push(photo);
        }
        state.error = null;
      })
      .addCase(uploadDogPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });

    // Delete photo
    builder
      .addCase(deleteDogPhoto.fulfilled, (state, action) => {
        const { dogId, photoId } = action.payload;
        const dogIndex = state.myDogs.findIndex(dog => dog.id === dogId);
        if (dogIndex !== -1 && state.myDogs[dogIndex].photos) {
          state.myDogs[dogIndex].photos = state.myDogs[dogIndex].photos.filter(
            photo => photo.id !== photoId
          );
        }
      });
  },
});

export const {
  clearError,
  setUploadProgress,
  clearUploadProgress,
  removeFromDiscover,
  clearDiscoverDogs,
} = dogsSlice.actions;
export default dogsSlice.reducer;
