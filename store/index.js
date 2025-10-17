import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import dogsReducer from './slices/dogsSlice';
import matchesReducer from './slices/matchesSlice';
import eventsReducer from './slices/eventsSlice';
import chatsReducer from './slices/chatsSlice';
import socketReducer from './slices/socketSlice';
import uiReducer from './slices/uiSlice';

// Import middleware
import { createSocketMiddleware } from './middleware/socketMiddleware';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  dogs: dogsReducer,
  matches: matchesReducer,
  events: eventsReducer,
  chats: chatsReducer,
  socket: socketReducer,
  ui: uiReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(createSocketMiddleware()),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Types for TypeScript-style development
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
