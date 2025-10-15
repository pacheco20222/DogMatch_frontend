// Chat service for managing real-time messaging functionality
import { apiFetch } from '../api/client';

class ChatService {
  constructor() {
    this.messageCache = new Map(); // Cache messages by match ID
    this.typingUsers = new Map(); // Track typing users by match ID
    this.unreadCounts = new Map(); // Track unread message counts
  }

  // API-based message operations
  async getMessages(matchId, limit = 50, offset = 0, token) {
    try {
      const response = await apiFetch(`/api/messages/matches/${matchId}/messages?limit=${limit}&offset=${offset}`, {
        token
      });
      
      // Cache messages
      this.messageCache.set(matchId, response.messages || []);
      
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(matchId, content, messageType = 'text', additionalData = {}, token) {
    try {
      const response = await apiFetch(`/api/messages/matches/${matchId}/messages`, {
        method: 'POST',
        token,
        body: {
          content,
          message_type: messageType,
          ...additionalData
        }
      });

      // Add to cache optimistically
      const cachedMessages = this.messageCache.get(matchId) || [];
      cachedMessages.push(response.data);
      this.messageCache.set(matchId, cachedMessages);

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getConversations(token) {
    try {
      const response = await apiFetch('/api/messages/conversations', { token });
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getUnreadCount(matchId, token) {
    try {
      const response = await apiFetch(`/api/messages/matches/${matchId}/messages/unread-count`, { token });
      this.unreadCounts.set(matchId, response.unread_count);
      return response;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId, token) {
    try {
      const response = await apiFetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        token
      });
      return response;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Socket-based real-time operations
  setupSocketListeners(socket, callbacks = {}) {
    if (!socket) return;

    // Message events
    socket.on('new_message', (messageData) => {
      console.log('💬 New message received:', messageData);
      
      // Add to cache
      const matchId = messageData.match_id;
      const cachedMessages = this.messageCache.get(matchId) || [];
      cachedMessages.push(messageData);
      this.messageCache.set(matchId, cachedMessages);

      // Update unread count if not from current user
      if (!messageData.is_from_current_user) {
        const currentCount = this.unreadCounts.get(matchId) || 0;
        this.unreadCounts.set(matchId, currentCount + 1);
      }

      // Call callback
      if (callbacks.onNewMessage) {
        callbacks.onNewMessage(messageData);
      }
    });

    socket.on('message_sent', (data) => {
      console.log('✅ Message sent confirmation:', data);
      if (callbacks.onMessageSent) {
        callbacks.onMessageSent(data);
      }
    });

    socket.on('message_read', (readData) => {
      console.log('✅ Message read receipt:', readData);
      if (callbacks.onMessageRead) {
        callbacks.onMessageRead(readData);
      }
    });

    // Typing events
    socket.on('user_typing', (typingData) => {
      console.log('⌨️ User typing:', typingData);
      
      const matchId = typingData.match_id;
      const userId = typingData.user_id;
      
      if (typingData.is_typing) {
        // Add to typing users
        const typingUsers = this.typingUsers.get(matchId) || new Set();
        typingUsers.add(userId);
        this.typingUsers.set(matchId, typingUsers);
      } else {
        // Remove from typing users
        const typingUsers = this.typingUsers.get(matchId) || new Set();
        typingUsers.delete(userId);
        this.typingUsers.set(matchId, typingUsers);
      }

      if (callbacks.onUserTyping) {
        callbacks.onUserTyping(typingData);
      }
    });

    // Connection events
    socket.on('connected', (data) => {
      console.log('✅ Socket connected:', data);
      if (callbacks.onConnected) {
        callbacks.onConnected(data);
      }
    });

    socket.on('joined_match', (data) => {
      console.log('✅ Joined match room:', data);
      if (callbacks.onJoinedMatch) {
        callbacks.onJoinedMatch(data);
      }
    });

    socket.on('left_match', (data) => {
      console.log('✅ Left match room:', data);
      if (callbacks.onLeftMatch) {
        callbacks.onLeftMatch(data);
      }
    });

    // User presence events
    socket.on('user_online', (userData) => {
      console.log('🟢 User online:', userData);
      if (callbacks.onUserOnline) {
        callbacks.onUserOnline(userData);
      }
    });

    socket.on('user_offline', (userData) => {
      console.log('🔴 User offline:', userData);
      if (callbacks.onUserOffline) {
        callbacks.onUserOffline(userData);
      }
    });

    // Error events
    socket.on('error', (errorData) => {
      console.error('❌ Socket error:', errorData);
      if (callbacks.onError) {
        callbacks.onError(errorData);
      }
    });
  }

  // Utility functions
  getCachedMessages(matchId) {
    return this.messageCache.get(matchId) || [];
  }

  getTypingUsers(matchId) {
    return Array.from(this.typingUsers.get(matchId) || []);
  }

  getUnreadCount(matchId) {
    return this.unreadCounts.get(matchId) || 0;
  }

  clearUnreadCount(matchId) {
    this.unreadCounts.set(matchId, 0);
  }

  clearCache(matchId = null) {
    if (matchId) {
      this.messageCache.delete(matchId);
      this.typingUsers.delete(matchId);
      this.unreadCounts.delete(matchId);
    } else {
      this.messageCache.clear();
      this.typingUsers.clear();
      this.unreadCounts.clear();
    }
  }

  // Format message for display
  formatMessage(message, currentUserId) {
    return {
      ...message,
      isFromCurrentUser: message.sender_user_id === currentUserId,
      timestamp: new Date(message.sent_at),
      isRead: message.is_read || message.sender_user_id === currentUserId
    };
  }

  // Group messages by date
  groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.sent_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.keys(groups).map(date => ({
      date,
      messages: groups[date]
    }));
  }

  // Check if user is typing
  isUserTyping(matchId, userId) {
    const typingUsers = this.typingUsers.get(matchId) || new Set();
    return typingUsers.has(userId);
  }

  // Get typing indicator text
  getTypingIndicatorText(matchId, currentUserId) {
    const typingUsers = this.typingUsers.get(matchId) || new Set();
    const otherTypingUsers = Array.from(typingUsers).filter(userId => userId !== currentUserId);
    
    if (otherTypingUsers.length === 0) {
      return null;
    } else if (otherTypingUsers.length === 1) {
      return 'Someone is typing...';
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
