import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  connectSocket,
  disconnectSocket,
  reconnectSocket,
  joinMatch,
  leaveMatch,
  sendMessage,
  sendTypingIndicator,
  markMessageAsRead,
  ping,
} from '../store/slices/socketSlice';

// Custom hook to replace useSocket from SocketContext
export const useSocket = () => {
  const dispatch = useAppDispatch();
  const socketState = useAppSelector(state => state.socket);

  // Socket connection functions
  const connect = () => {
    dispatch(connectSocket());
  };

  const disconnect = () => {
    dispatch(disconnectSocket());
  };

  const reconnect = () => {
    dispatch(reconnectSocket());
  };

  // Socket utility functions
  const joinMatchRoom = (matchId) => {
    dispatch(joinMatch(matchId));
  };

  const leaveMatchRoom = (matchId) => {
    dispatch(leaveMatch(matchId));
  };

  const sendChatMessage = (matchId, content, messageType = 'text', additionalData = {}) => {
    dispatch(sendMessage({
      matchId,
      content,
      messageType,
      additionalData
    }));
  };

  const sendTyping = (matchId, isTyping) => {
    dispatch(sendTypingIndicator({
      matchId,
      isTyping
    }));
  };

  const markAsRead = (messageId) => {
    dispatch(markMessageAsRead(messageId));
  };

  const pingServer = () => {
    dispatch(ping());
  };

  return {
    // Connection state
    isConnected: socketState.isConnected,
    connectionError: socketState.connectionError,
    connectionStatus: socketState.connectionStatus,
    reconnectAttempts: socketState.reconnectAttempts,
    socketId: socketState.socketId,
    
    // Connection functions
    connect,
    disconnect,
    reconnect,
    
    // Socket utility functions
    joinMatch: joinMatchRoom,
    leaveMatch: leaveMatchRoom,
    sendMessage: sendChatMessage,
    sendTypingIndicator: sendTyping,
    markMessageAsRead: markAsRead,
    ping: pingServer,
  };
};
