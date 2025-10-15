import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Backend URL - use production URL for deployed backend
  const SOCKET_URL = 'https://dogmatch-backend.onrender.com';

  useEffect(() => {
    console.log('🔌 SocketContext useEffect triggered:', { isAuthenticated, hasAccessToken: !!accessToken });
    if (isAuthenticated && accessToken) {
      console.log('🔌 Attempting to connect socket...');
      connectSocket();
    } else {
      console.log('🔌 Disconnecting socket (not authenticated or no token)');
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken]);

  const connectSocket = () => {
    if (socket && socket.connected) {
      return; // Already connected
    }

    console.log('🔌 Attempting to connect to Socket.IO server:', SOCKET_URL);
    console.log('🔌 Using access token:', accessToken ? 'Present' : 'Missing');

    try {
      // Create socket connection with JWT token
          const newSocket = io(SOCKET_URL, {
            auth: {
              token: accessToken
            },
            query: {
              token: accessToken
            },
            transports: ['polling', 'websocket'], // Try polling first for Render compatibility
            timeout: 20000,
            forceNew: true,
            upgrade: true,
            rememberUpgrade: false
          });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          scheduleReconnect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
        console.error('🔌 Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        });
        setConnectionError(error.message);
        setIsConnected(false);
        
        // Handle authentication errors
        if (error.message.includes('Authentication') || error.message.includes('401')) {
          console.log('🔌 Authentication failed, will not retry');
          return;
        }
        
        scheduleReconnect();
      });

      newSocket.on('error', (error) => {
        console.error('🔌 Socket error:', error);
        setConnectionError(error.message);
      });

      // Chat-specific event handlers
      newSocket.on('new_message', (messageData) => {
        console.log('💬 New message received:', messageData);
        // This will be handled by components that listen to this event
      });

      newSocket.on('user_typing', (typingData) => {
        console.log('⌨️ User typing:', typingData);
        // This will be handled by components that listen to this event
      });

      newSocket.on('message_read', (readData) => {
        console.log('✅ Message read:', readData);
        // This will be handled by components that listen to this event
      });

      newSocket.on('user_online', (userData) => {
        console.log('🟢 User online:', userData);
        // This will be handled by components that listen to this event
      });

      newSocket.on('user_offline', (userData) => {
        console.log('🔴 User offline:', userData);
        // This will be handled by components that listen to this event
      });

      newSocket.on('connected', (data) => {
        console.log('✅ Socket authentication successful:', data);
      });

      newSocket.on('error', (errorData) => {
        console.error('❌ Socket error:', errorData);
        Alert.alert('Connection Error', errorData.message || 'An error occurred');
      });

      setSocket(newSocket);

    } catch (error) {
      console.error('🔌 Failed to create socket connection:', error);
      setConnectionError(error.message);
    }
  };

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socket) {
      console.log('🔌 Manually disconnecting socket');
      socket.disconnect();
      setSocket(null);
    }
    setIsConnected(false);
    setConnectionError(null);
  };

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('🔌 Max reconnection attempts reached');
      setConnectionError('Unable to connect to chat server');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;

    console.log(`🔌 Scheduling reconnect attempt ${reconnectAttempts.current} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && accessToken) {
        connectSocket();
      }
    }, delay);
  };

  const reconnect = () => {
    reconnectAttempts.current = 0;
    setConnectionError(null);
    connectSocket();
  };

  // Socket utility functions
  const joinMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('join_match', { match_id: matchId });
    }
  };

  const leaveMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('leave_match', { match_id: matchId });
    }
  };

  const sendMessage = (matchId, content, messageType = 'text', additionalData = {}) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        match_id: matchId,
        content,
        message_type: messageType,
        ...additionalData
      });
    }
  };

  const sendTypingIndicator = (matchId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        match_id: matchId,
        is_typing: isTyping
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && isConnected) {
      socket.emit('read_receipt', { message_id: messageId });
    }
  };

  const ping = () => {
    if (socket && isConnected) {
      socket.emit('ping');
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    reconnect,
    // Socket utility functions
    joinMatch,
    leaveMatch,
    sendMessage,
    sendTypingIndicator,
    markMessageAsRead,
    ping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
