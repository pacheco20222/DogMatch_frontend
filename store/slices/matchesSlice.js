import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';

// Async thunks
export const swipeDog = createAsyncThunk(
  'matches/swipe',
  async ({ dogId, action }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/matches/swipe', {
        method: 'POST',
        body: { target_dog_id: dogId, action },
        token: auth.accessToken,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to swipe');
    }
  }
);

export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Build query string if status is provided
      const queryParams = new URLSearchParams();
      if (params.status) {
        queryParams.append('status', params.status);
      }
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/api/matches/?${queryString}` : '/api/matches/';
      
      const response = await apiFetch(endpoint, {
        token: auth.accessToken,
      });
      
      return response.matches || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch matches');
    }
  }
);

export const fetchPendingSwipes = createAsyncThunk(
  'matches/fetchPending',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/matches/pending', {
        token: auth.accessToken,
      });
      
      console.log('📥 Pending swipes response:', response);
      
      return response.pending_matches || response.pending_swipes || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending swipes');
    }
  }
);

export const respondToSwipe = createAsyncThunk(
  'matches/respond',
  async ({ matchId, action }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const result = await apiFetch(`/api/matches/${matchId}/respond`, {
        method: 'POST',
        body: { action },
        token: auth.accessToken,
      });
      
      return { matchId, action, result };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to respond to swipe');
    }
  }
);

export const unmatch = createAsyncThunk(
  'matches/unmatch',
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/matches/${matchId}/unmatch`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      
      return matchId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to unmatch');
    }
  }
);

export const fetchMatchStats = createAsyncThunk(
  'matches/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/matches/stats', {
        token: auth.accessToken,
      });
      
      return response.stats || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch match stats');
    }
  }
);

// Initial state
const initialState = {
  matches: [],
  pendingSwipes: [],
  stats: {
    total_matches: 0,
    total_swipes: 0,
    total_likes: 0,
    total_passes: 0,
    total_super_likes: 0,
  },
  loading: false,
  pendingLoading: false,
  error: null,
  lastSwipe: null,
  lastMatch: null,
};

// Matches slice
const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLastSwipe: (state, action) => {
      state.lastSwipe = action.payload;
    },
    setLastMatch: (state, action) => {
      state.lastMatch = action.payload;
    },
    clearLastSwipe: (state) => {
      state.lastSwipe = null;
    },
    clearLastMatch: (state) => {
      state.lastMatch = null;
    },
    addNewMatch: (state, action) => {
      state.matches.unshift(action.payload);
      state.stats.total_matches += 1;
    },
    removeMatch: (state, action) => {
      state.matches = state.matches.filter(match => match.id !== action.payload);
      state.stats.total_matches = Math.max(0, state.stats.total_matches - 1);
    },
    removePendingSwipe: (state, action) => {
      state.pendingSwipes = state.pendingSwipes.filter(swipe => swipe.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Swipe dog
    builder
      .addCase(swipeDog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(swipeDog.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSwipe = action.payload;
        
        // Update stats
        if (action.payload.action === 'like') {
          state.stats.total_likes += 1;
        } else if (action.payload.action === 'pass') {
          state.stats.total_passes += 1;
        } else if (action.payload.action === 'super_like') {
          state.stats.total_super_likes += 1;
        }
        state.stats.total_swipes += 1;
        
        // If it's a match, add to matches
        if (action.payload.is_match) {
          state.lastMatch = action.payload.match;
          state.matches.unshift(action.payload.match);
          state.stats.total_matches += 1;
        }
        
        state.error = null;
      })
      .addCase(swipeDog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
        state.error = null;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch pending swipes
    builder
      .addCase(fetchPendingSwipes.pending, (state) => {
        state.pendingLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingSwipes.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingSwipes = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingSwipes.rejected, (state, action) => {
        state.pendingLoading = false;
        state.error = action.payload;
      });

    // Respond to swipe
    builder
      .addCase(respondToSwipe.fulfilled, (state, action) => {
        const { swipeId, response, result } = action.payload;
        
        // Remove from pending swipes
        state.pendingSwipes = state.pendingSwipes.filter(swipe => swipe.id !== swipeId);
        
        // If it's a match, add to matches
        if (result.is_match) {
          state.matches.unshift(result.match);
          state.stats.total_matches += 1;
        }
      });

    // Unmatch
    builder
      .addCase(unmatch.fulfilled, (state, action) => {
        state.matches = state.matches.filter(match => match.id !== action.payload);
        state.stats.total_matches = Math.max(0, state.stats.total_matches - 1);
      });

    // Fetch match stats
    builder
      .addCase(fetchMatchStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      });
  },
});

export const {
  clearError,
  setLastSwipe,
  setLastMatch,
  clearLastSwipe,
  clearLastMatch,
  addNewMatch,
  removeMatch,
  removePendingSwipe,
} = matchesSlice.actions;
export default matchesSlice.reducer;
