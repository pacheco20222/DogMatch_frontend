import { io } from 'socket.io-client';
import config from '../../config';
import {
  setConnected,
  setDisconnected,
  setConnecting,
  setConnectionError,
  clearConnectionError,
  resetReconnectAttempts,
} from '../slices/socketSlice';

// Socket middleware for Redux
export const createSocketMiddleware = () => {
  console.log('🔌🔌🔌 SOCKET MIDDLEWARE CREATED');
  let socket = null;
  let reconnectTimeout = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let joinedRooms = new Set(); // Track joined rooms to prevent duplicates

  return (store) => (next) => (action) => {
    // Log ALL actions to debug middleware execution
    if (action.type && (action.type.includes('socket') || action.type.includes('auth'))) {
      console.log('🔌🔌🔌 MIDDLEWARE RECEIVED ACTION:', action.type, action.payload ? JSON.stringify(action.payload).substring(0, 100) : 'no payload');
    }
    
    const result = next(action);
    const state = store.getState();

    // Handle socket connection actions
    switch (action.type) {
      case 'socket/connect':
        connectSocket(store);
        break;
      case 'socket/disconnect':
        disconnectSocket(store);
        break;
      case 'socket/reconnect':
        reconnectSocket(store);
        break;
      case 'socket/joinMatch':
        joinMatch(action.payload);
        break;
      case 'socket/leaveMatch':
        leaveMatch(action.payload);
        break;
      case 'socket/sendMessage':
        sendMessage(action.payload);
        break;
      case 'socket/sendTypingIndicator':
        sendTypingIndicator(action.payload);
        break;
      case 'socket/markMessageAsRead':
        markMessageAsRead(action.payload);
        break;
      case 'socket/ping':
        ping();
        break;
      case 'auth/loginUser/fulfilled':
      case 'auth/refreshToken/fulfilled':
        // Auto-connect socket when user logs in or token is refreshed
        if (state.auth.isAuthenticated && state.auth.accessToken) {
          connectSocket(store);
        }
        break;
      case 'auth/logoutUser/fulfilled':
        // Auto-disconnect socket when user logs out
        disconnectSocket(store);
        break;
    }

    return result;
  };

  function connectSocket(store) {
    console.log('🔌🔌🔌 CONNECTSOCKET FUNCTION CALLED');
    const state = store.getState();
    const { accessToken, isAuthenticated } = state.auth;

    console.log('🔌 Auth state:', { isAuthenticated, hasToken: !!accessToken });

    if (!isAuthenticated || !accessToken) {
      console.log('🔌 Cannot connect socket: not authenticated or no token');
      return;
    }

    if (socket) {
      if (socket.connected) {
        console.log('🔌 Socket already connected');
        return;
      }
      // Disconnect and cleanup old socket instance
      console.log('🔌 Cleaning up old socket instance');
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    console.log('🔌 Attempting to connect to Socket.IO server:', config.SOCKET_URL);
    store.dispatch(setConnecting());

    try {
      socket = io(config.SOCKET_URL, {
        auth: {
          token: accessToken
        },
        query: {
          token: accessToken
        },
        transports: ['websocket', 'polling'], // Try websocket first
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 3, // Limit reconnection attempts
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        forceNew: false, // Reuse existing connection if possible
        upgrade: true,
        rememberUpgrade: true // Remember successful websocket upgrade
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        console.log('🔌 Dispatching setConnected action');
        store.dispatch(setConnected({ socketId: socket.id }));
        reconnectAttempts = 0;
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        store.dispatch(setDisconnected());
        joinedRooms.clear(); // Clear joined rooms on disconnect
        
        // Socket.IO will handle auto-reconnection, no manual scheduling needed
        if (reason === 'io client disconnect') {
          console.log('🔌 Manual disconnect, will not reconnect');
        } else {
          console.log('🔌 Socket.IO will handle automatic reconnection');
        }
      });

      socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
        store.dispatch(setConnectionError(error.message));
        reconnectAttempts += 1;
        
        // Handle authentication errors
        if (error.message.includes('Authentication') || error.message.includes('401')) {
          console.log('🔌 Authentication failed, stopping reconnection');
          socket.disconnect();
          return;
        }
        
        // Check if we've exceeded max attempts
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('🔌 Max reconnection attempts reached, disconnecting');
          store.dispatch(setConnectionError('Unable to connect to chat server'));
          socket.disconnect();
        }
        // Otherwise Socket.IO's built-in reconnection will handle it
      });

      socket.on('error', (error) => {
        console.error('🔌 Socket error:', error);
        store.dispatch(setConnectionError(error.message));
      });

      // Chat-specific event handlers
      socket.on('new_message', (messageData) => {
        console.log('💬💬💬 NEW_MESSAGE EVENT RECEIVED 💬💬💬');
        console.log('📦 Message data:', JSON.stringify(messageData, null, 2));
        console.log('🔑 Match ID from message:', messageData.match_id);
        console.log('👤 Sender user ID:', messageData.sender_user_id);
        console.log('📝 Content:', messageData.content);
        console.log('🏷️ Is sent by me:', messageData.is_sent_by_me);
        
        // Dispatch action to update chat state
        store.dispatch({
          type: 'chats/newMessage',
          payload: messageData
        });
        
        console.log('✅ Dispatched chats/newMessage action to Redux');
      });

      socket.on('user_typing', (typingData) => {
        console.log('⌨️ User typing:', typingData);
        store.dispatch({
          type: 'chats/userTyping',
          payload: typingData
        });
      });

      socket.on('message_read', (readData) => {
        console.log('✅ Message read:', readData);
        store.dispatch({
          type: 'chats/messageRead',
          payload: readData
        });
      });

      socket.on('user_online', (userData) => {
        console.log('🟢 User online:', userData);
        store.dispatch({
          type: 'chats/userOnline',
          payload: userData
        });
      });

      socket.on('user_offline', (userData) => {
        console.log('🔴 User offline:', userData);
        store.dispatch({
          type: 'chats/userOffline',
          payload: userData
        });
      });

      socket.on('connected', (data) => {
        console.log('✅ Socket authentication successful:', data);
      });

      socket.on('joined_match', (data) => {
        console.log('✅✅✅ JOINED_MATCH CONFIRMATION ✅✅✅');
        console.log('📦 Data:', JSON.stringify(data, null, 2));
      });

      socket.on('error', (errorData) => {
        console.error('❌❌❌ SOCKET ERROR EVENT ❌❌❌');
        console.error('📦 Error:', JSON.stringify(errorData, null, 2));
      });

    } catch (error) {
      console.error('🔌 Failed to create socket connection:', error);
      store.dispatch(setConnectionError(error.message));
    }
  }

  function disconnectSocket(store) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (socket) {
      console.log('🔌 Manually disconnecting socket');
      socket.disconnect();
      socket = null;
    }
    
    store.dispatch(setDisconnected());
    store.dispatch(clearConnectionError());
  }

  function reconnectSocket(store) {
    reconnectAttempts = 0;
    store.dispatch(resetReconnectAttempts());
    store.dispatch(clearConnectionError());
    connectSocket(store);
  }

  function scheduleReconnect(store) {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('🔌 Max reconnection attempts reached');
      store.dispatch(setConnectionError('Unable to connect to chat server'));
      return;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    reconnectAttempts += 1;

    console.log(`🔌 Scheduling reconnect attempt ${reconnectAttempts} in ${delay}ms`);

    reconnectTimeout = setTimeout(() => {
      const state = store.getState();
      if (state.auth.isAuthenticated && state.auth.accessToken) {
        connectSocket(store);
      }
    }, delay);
  }

  // Socket utility functions
  function joinMatch(matchId) {
    if (socket && socket.connected && !joinedRooms.has(matchId)) {
      console.log('�🟢🟢 JOINING MATCH ROOM 🟢🟢🟢');
      console.log('🔑 Match ID:', matchId);
      console.log('🔌 Socket ID:', socket.id);
      console.log('📍 Currently joined rooms:', Array.from(joinedRooms));
      socket.emit('join_match', { match_id: matchId });
      joinedRooms.add(matchId);
      console.log('✅ Emitted join_match and added to local tracking');
    } else {
      console.log('⚠️ Cannot join match room:');
      console.log('  - Socket connected:', socket?.connected);
      console.log('  - Already in room:', joinedRooms.has(matchId));
      console.log('  - Match ID:', matchId);
    }
  }

  function leaveMatch(matchId) {
    if (socket && socket.connected && joinedRooms.has(matchId)) {
      console.log('🔌 Leaving match room:', matchId);
      socket.emit('leave_match', { match_id: matchId });
      joinedRooms.delete(matchId);
    }
  }

  function sendMessage({ matchId, content, messageType = 'text', additionalData = {} }) {
    if (socket && socket.connected) {
      socket.emit('send_message', {
        match_id: matchId,
        content,
        message_type: messageType,
        ...additionalData
      });
    }
  }

  function sendTypingIndicator({ matchId, isTyping }) {
    if (socket && socket.connected) {
      socket.emit('typing', {
        match_id: matchId,
        is_typing: isTyping
      });
    }
  }

  function markMessageAsRead(messageId) {
    if (socket && socket.connected) {
      socket.emit('read_receipt', { message_id: messageId });
    }
  }

  function ping() {
    if (socket && socket.connected) {
      socket.emit('ping');
    }
  }
};
