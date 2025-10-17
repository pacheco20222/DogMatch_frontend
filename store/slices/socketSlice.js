import { createSlice, createAction } from '@reduxjs/toolkit';

// Socket action creators for middleware
export const connectSocket = createAction('socket/connect');
export const disconnectSocket = createAction('socket/disconnect');
export const reconnectSocket = createAction('socket/reconnect');
export const joinMatch = createAction('socket/joinMatch');
export const leaveMatch = createAction('socket/leaveMatch');
export const sendMessage = createAction('socket/sendMessage');
export const sendTypingIndicator = createAction('socket/sendTypingIndicator');
export const markMessageAsRead = createAction('socket/markMessageAsRead');
export const ping = createAction('socket/ping');

// Socket slice for managing socket connection state
const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    isConnected: false,
    connectionError: null,
    reconnectAttempts: 0,
    lastConnected: null,
    lastDisconnected: null,
    connectionStatus: 'disconnected', // 'connecting', 'connected', 'disconnected', 'error'
    socketId: null,
  },
  reducers: {
    setConnected: (state, action) => {
      console.log('🔌 Socket slice: setConnected action received', action.payload);
      state.isConnected = true;
      state.connectionError = null;
      state.reconnectAttempts = 0;
      state.lastConnected = new Date().toISOString();
      state.connectionStatus = 'connected';
      state.socketId = action.payload?.socketId || null;
    },
    setDisconnected: (state, action) => {
      state.isConnected = false;
      state.lastDisconnected = new Date().toISOString();
      state.connectionStatus = 'disconnected';
      state.socketId = null;
    },
    setConnecting: (state) => {
      state.connectionStatus = 'connecting';
      state.connectionError = null;
    },
    setConnectionError: (state, action) => {
      state.isConnected = false;
      state.connectionError = action.payload;
      state.connectionStatus = 'error';
      state.reconnectAttempts += 1;
    },
    clearConnectionError: (state) => {
      state.connectionError = null;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
  },
});

export const {
  setConnected,
  setDisconnected,
  setConnecting,
  setConnectionError,
  clearConnectionError,
  resetReconnectAttempts,
  setConnectionStatus,
} = socketSlice.actions;
export default socketSlice.reducer;
