import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/events', {
        token: auth.accessToken,
      });
      
      return response.events || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch events');
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/events/my-events', {
        token: auth.accessToken,
      });
      
      return response.events || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my events');
    }
  }
);

export const fetchMyRegistrations = createAsyncThunk(
  'events/fetchMyRegistrations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/events/my-registrations', {
        token: auth.accessToken,
      });
      
      return response.registrations || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my registrations');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/events', {
        method: 'POST',
        body: eventData,
        token: auth.accessToken,
      });
      
      return response.event || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, eventData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/events/${id}`, {
        method: 'PUT',
        body: eventData,
        token: auth.accessToken,
      });
      
      return response.event || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      
      return eventId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete event');
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'events/register',
  async ({ eventId, registrationData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        body: registrationData,
        token: auth.accessToken,
      });
      
      return { eventId, registration: response.registration || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to register for event');
    }
  }
);

export const unregisterFromEvent = createAsyncThunk(
  'events/unregister',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/events/${eventId}/unregister`, {
        method: 'DELETE',
        token: auth.accessToken,
      });

      // Server now returns the cancelled registration object. Return canonical data
      // so reducers and UI can rely on server authoritative shape.
      return { eventId, registration: response.registration || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to unregister from event');
    }
  }
);

export const uploadEventPhoto = createAsyncThunk(
  'events/uploadPhoto',
  async ({ eventId, photoData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', {
        uri: photoData.uri,
        type: photoData.type || 'image/jpeg',
        name: photoData.name || 'event.jpg',
      });
      
      const response = await apiFetch(`/api/events/${eventId}/photo`, {
        method: 'POST',
        body: formData,
        token: auth.accessToken,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { eventId, photo: response.photo || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload event photo');
    }
  }
);

// Initial state
const initialState = {
  events: [],
  myEvents: [],
  myRegistrations: [],
  loading: false,
  myEventsLoading: false,
  registrationsLoading: false,
  error: null,
  uploadProgress: 0,
  lastFetch: null,
};

// Events slice
const eventsSlice = createSlice({
  name: 'events',
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
    updateEventRegistration: (state, action) => {
      const { eventId, registration } = action.payload;
      const eventIndex = state.events.findIndex(event => event.id === eventId);
      if (eventIndex !== -1) {
        state.events[eventIndex].user_registration = registration;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch my events
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.myEventsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.myEventsLoading = false;
        state.myEvents = action.payload;
        state.error = null;
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.myEventsLoading = false;
        state.error = action.payload;
      });

    // Fetch my registrations
    builder
      .addCase(fetchMyRegistrations.pending, (state) => {
        state.registrationsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.registrationsLoading = false;
        state.myRegistrations = action.payload;
        state.error = null;
      })
      .addCase(fetchMyRegistrations.rejected, (state, action) => {
        state.registrationsLoading = false;
        state.error = action.payload;
      });

    // Create event
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.myEvents.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload;
        
        // Update in events array
        const eventIndex = state.events.findIndex(event => event.id === updatedEvent.id);
        if (eventIndex !== -1) {
          state.events[eventIndex] = updatedEvent;
        }
        
        // Update in myEvents array
        const myEventIndex = state.myEvents.findIndex(event => event.id === updatedEvent.id);
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = updatedEvent;
        }
        
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete event
    builder
      .addCase(deleteEvent.fulfilled, (state, action) => {
        const eventId = action.payload;
        state.events = state.events.filter(event => event.id !== eventId);
        state.myEvents = state.myEvents.filter(event => event.id !== eventId);
      });

    // Register for event
    builder
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const { eventId, registration } = action.payload;
        
        // Update event registration status
        const eventIndex = state.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].user_registration = registration;
        }
        
        // Add to my registrations
        state.myRegistrations.unshift(registration);
      });

    // Unregister from event (now uses canonical registration payload)
    builder
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        const payload = action.payload || {};
        const { eventId: returnedEventId, registration } = payload;

        // Determine event id (fall back to registration.event_id)
        const id = returnedEventId || registration?.event_id || registration?.eventId;

        // Update event registration with canonical object (may be cancelled)
        const eventIndex = state.events.findIndex(event => event.id === id);
        if (eventIndex !== -1) {
          state.events[eventIndex].user_registration = registration || null;
        }

        // Update myRegistrations: if registration is cancelled remove it, otherwise update/add
        if (registration) {
          if (registration.status === 'cancelled' || registration.status === 'cancelled_by_user') {
            state.myRegistrations = state.myRegistrations.filter(reg => reg.id !== registration.id && reg.event_id !== id);
          } else {
            // Replace existing registration or add to front
            const idx = state.myRegistrations.findIndex(reg => reg.id === registration.id || reg.event_id === id);
            if (idx !== -1) {
              state.myRegistrations[idx] = registration;
            } else {
              state.myRegistrations.unshift(registration);
            }
          }
        } else if (id) {
          // No registration object returned: fallback to remove by event id
          state.myRegistrations = state.myRegistrations.filter(reg => reg.event_id !== id);
        }
      });

    // Upload photo
    builder
      .addCase(uploadEventPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadEventPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadProgress = 100;
        const { eventId, photo } = action.payload;
        
        // Update event with new photo
        const eventIndex = state.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].photo_url = photo.url;
        }
        
        const myEventIndex = state.myEvents.findIndex(event => event.id === eventId);
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex].photo_url = photo.url;
        }
        
        state.error = null;
      })
      .addCase(uploadEventPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });
  },
});

export const {
  clearError,
  setUploadProgress,
  clearUploadProgress,
  updateEventRegistration,
} = eventsSlice.actions;
export default eventsSlice.reducer;
