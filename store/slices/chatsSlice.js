import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../api/client';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chats/fetchConversations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch('/api/messages/conversations', {
        token: auth.accessToken,
      });
      
      return response.conversations || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/messages/matches/${matchId}/messages`, {
        token: auth.accessToken,
      });
      
      return { matchId, messages: response.messages || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ matchId, messageData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/messages/matches/${matchId}/messages`, {
        method: 'POST',
        body: messageData,
        token: auth.accessToken,
      });
      
      return { matchId, message: response.message || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'chats/markAsRead',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        token: auth.accessToken,
      });
      
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark message as read');
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'chats/markConversationAsRead',
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/matches/${matchId}/messages/read`, {
        method: 'POST',
        token: auth.accessToken,
      });
      
      return matchId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark conversation as read');
    }
  }
);

export const editMessage = createAsyncThunk(
  'chats/editMessage',
  async ({ messageId, content }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        body: { content },
        token: auth.accessToken,
      });
      
      return response.message || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to edit message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chats/deleteMessage',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await apiFetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete message');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chats/fetchUnreadCount',
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await apiFetch(`/api/matches/${matchId}/messages/unread-count`, {
        token: auth.accessToken,
      });
      
      return { matchId, unreadCount: response.unread_count || 0 };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

// Initial state
const initialState = {
  conversations: [],
  messages: {}, // { matchId: [messages] }
  loading: false,
  messagesLoading: {},
  error: null,
  typing: {}, // { matchId: [userIds] }
  unreadCounts: {}, // { matchId: count }
  lastMessage: null,
};

// Chats slice
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      const { matchId, message } = action.payload;
      if (!state.messages[matchId]) {
        state.messages[matchId] = [];
      }
      state.messages[matchId].push(message);
      state.lastMessage = message;
      
      // Update conversation last message
      const conversation = state.conversations.find(conv => conv.match.id === matchId);
      if (conversation) {
        conversation.last_message = message;
        conversation.updated_at = message.created_at;
      }
    },
    updateMessage: (state, action) => {
      const { matchId, messageId, updates } = action.payload;
      if (state.messages[matchId]) {
        const messageIndex = state.messages[matchId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[matchId][messageIndex] = { ...state.messages[matchId][messageIndex], ...updates };
        }
      }
    },
    removeMessage: (state, action) => {
      const { matchId, messageId } = action.payload;
      if (state.messages[matchId]) {
        state.messages[matchId] = state.messages[matchId].filter(msg => msg.id !== messageId);
      }
    },
    setTyping: (state, action) => {
      const { matchId, userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typing[matchId]) {
          state.typing[matchId] = [];
        }
        if (!state.typing[matchId].includes(userId)) {
          state.typing[matchId].push(userId);
        }
      } else {
        if (state.typing[matchId]) {
          state.typing[matchId] = state.typing[matchId].filter(id => id !== userId);
        }
      }
    },
    clearTyping: (state, action) => {
      const { matchId } = action.payload;
      state.typing[matchId] = [];
    },
    updateUnreadCount: (state, action) => {
      const { matchId, count } = action.payload;
      state.unreadCounts[matchId] = count;
      
      // Update conversation unread count
      const conversation = state.conversations.find(conv => conv.match.id === matchId);
      if (conversation) {
        conversation.unread_count = count;
      }
    },
    clearLastMessage: (state) => {
      state.lastMessage = null;
    },
    // Socket event handlers
    newMessage: (state, action) => {
      const message = action.payload;
      const matchId = message.match_id;
      
      if (!state.messages[matchId]) {
        state.messages[matchId] = [];
      }
      
      // Prevent duplicate messages
      const existingMessage = state.messages[matchId].find(msg => msg.id === message.id);
      if (!existingMessage) {
        state.messages[matchId].push(message);
        state.lastMessage = message;
        
        // Update conversation last message and unread count only for new messages
        const conversation = state.conversations.find(conv => conv.match.id === matchId);
        if (conversation) {
          conversation.last_message = message;
          conversation.updated_at = message.created_at;
          
          // Increment unread count for messages not sent by current user
          if (!message.is_sent_by_me && !message.is_read) {
            conversation.unread_count = (conversation.unread_count || 0) + 1;
            state.unreadCounts[matchId] = conversation.unread_count;
          }
        }
      }
    },
    userTyping: (state, action) => {
      const { match_id, user_id, is_typing } = action.payload;
      if (is_typing) {
        if (!state.typing[match_id]) {
          state.typing[match_id] = [];
        }
        if (!state.typing[match_id].includes(user_id)) {
          state.typing[match_id].push(user_id);
        }
      } else {
        if (state.typing[match_id]) {
          state.typing[match_id] = state.typing[match_id].filter(id => id !== user_id);
        }
      }
    },
    messageRead: (state, action) => {
      const { message_id, read_at } = action.payload;
      
      // Find and update message in all conversations
      Object.keys(state.messages).forEach(matchId => {
        const messageIndex = state.messages[matchId].findIndex(msg => msg.id === message_id);
        if (messageIndex !== -1) {
          state.messages[matchId][messageIndex].read_at = read_at;
        }
      });
    },
    userOnline: (state, action) => {
      const { user_id } = action.payload;
      // Update user online status in conversations
      state.conversations.forEach(conversation => {
        if (conversation.match.user.id === user_id) {
          conversation.match.user.is_online = true;
        }
      });
    },
    userOffline: (state, action) => {
      const { user_id } = action.payload;
      // Update user offline status in conversations
      state.conversations.forEach(conversation => {
        if (conversation.match.user.id === user_id) {
          conversation.match.user.is_online = false;
        }
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const matchId = action.meta.arg;
        state.messagesLoading[matchId] = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { matchId, messages } = action.payload;
        state.messagesLoading[matchId] = false;
        state.messages[matchId] = messages;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const matchId = action.meta.arg;
        state.messagesLoading[matchId] = false;
        state.error = action.payload;
      });

    // Send message
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { matchId, message } = action.payload;
        if (!state.messages[matchId]) {
          state.messages[matchId] = [];
        }
        state.messages[matchId].push(message);
        state.lastMessage = message;
        
        // Update conversation
        const conversation = state.conversations.find(conv => conv.match.id === matchId);
        if (conversation) {
          conversation.last_message = message;
          conversation.updated_at = message.created_at;
        }
      });

    // Mark message as read
    builder
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        
        // Find and update message in all conversations
        Object.keys(state.messages).forEach(matchId => {
          const messageIndex = state.messages[matchId].findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            state.messages[matchId][messageIndex].read_at = new Date().toISOString();
          }
        });
      });

    // Mark conversation as read
    builder
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const matchId = action.payload;
        
        // Mark all messages in conversation as read
        if (state.messages[matchId]) {
          state.messages[matchId].forEach(message => {
            if (!message.read_at) {
              message.read_at = new Date().toISOString();
            }
          });
        }
        
        // Update unread count
        state.unreadCounts[matchId] = 0;
        const conversation = state.conversations.find(conv => conv.match.id === matchId);
        if (conversation) {
          conversation.unread_count = 0;
        }
      });

    // Edit message
    builder
      .addCase(editMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        
        // Find and update message in conversations
        Object.keys(state.messages).forEach(matchId => {
          const messageIndex = state.messages[matchId].findIndex(msg => msg.id === updatedMessage.id);
          if (messageIndex !== -1) {
            state.messages[matchId][messageIndex] = updatedMessage;
          }
        });
        
        // Update conversation last message if it's the last message
        const conversation = state.conversations.find(conv => 
          conv.last_message && conv.last_message.id === updatedMessage.id
        );
        if (conversation) {
          conversation.last_message = updatedMessage;
        }
      });

    // Delete message
    builder
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        
        // Remove message from all conversations
        Object.keys(state.messages).forEach(matchId => {
          state.messages[matchId] = state.messages[matchId].filter(msg => msg.id !== messageId);
        });
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        const { matchId, unreadCount } = action.payload;
        state.unreadCounts[matchId] = unreadCount;
        
        // Update conversation
        const conversation = state.conversations.find(conv => conv.match.id === matchId);
        if (conversation) {
          conversation.unread_count = unreadCount;
        }
      });
  },
});

export const {
  clearError,
  addMessage,
  updateMessage,
  removeMessage,
  setTyping,
  clearTyping,
  updateUnreadCount,
  clearLastMessage,
  newMessage,
  userTyping,
  messageRead,
  userOnline,
  userOffline,
} = chatsSlice.actions;
export default chatsSlice.reducer;
