import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMessages, sendMessage, markMessageAsRead } from '../store/slices/chatsSlice';
import { useChatService } from '../services/chatService';
import { apiFetch } from '../api/client';
import { store } from '../store';
import { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const ChatConversationScreen = ({ navigation, route }) => {
  const { matchId, otherUser, otherDog, match } = route.params;
  const { user } = useAuth();
  const { isConnected, joinMatch, leaveMatch, sendMessage: sendSocketMessage, sendTypingIndicator } = useSocket();
  const chatService = useChatService();
  const dispatch = useAppDispatch();
  const { messages: reduxMessages, loading, error } = useAppSelector(state => state.chats);
  
  const messages = reduxMessages[matchId] || [];
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Load messages on mount
  useFocusEffect(
    useCallback(() => {
      loadMessages();
      
      // Mark all messages as read when entering the chat
      markAllMessagesAsRead();
      
      return () => {
        // Mark all messages as read before leaving
        markAllMessagesAsRead();
      };
    }, [matchId])
  );

  // Handle socket connection changes
  useEffect(() => {
    if (isConnected) {
      console.log('🔌 ChatConversationScreen: Socket connected, joining match room', matchId);
      joinMatch(matchId);
    }
    
    return () => {
      // Leave match room when component unmounts
      if (isConnected) {
        console.log('🔌 ChatConversationScreen: Component unmounting, leaving match room', matchId);
        leaveMatch(matchId);
      }
    };
  }, [isConnected, matchId]); // Remove joinMatch and leaveMatch from dependencies

  // Socket listeners are now handled by Redux middleware
  // Real-time updates are managed through Redux state

  // Load messages from API
  const loadMessages = async () => {
    try {
      await dispatch(fetchMessages(matchId));
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    try {
      console.log('📖 Marking all messages as read for match', matchId);
      
      // Get current messages and mark unread ones as read
      const currentMessages = messages.filter(msg => 
        !msg.is_sent_by_me && !msg.is_read
      );
      
      // Mark each unread message as read
      for (const message of currentMessages) {
        try {
          await dispatch(markMessageAsRead(message.id));
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
      
      console.log('✅ All messages marked as read for match', matchId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Mark a single message as read
  const markSingleMessageAsRead = async (messageId) => {
    try {
      await dispatch(markMessageAsRead(messageId));
      
      // Update local state to reflect the read status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || sending) return;

    setSending(true);
    setMessageText('');
    
    // Stop typing indicator
    if (isTypingRef.current) {
      sendTypingIndicator(matchId, false);
      isTypingRef.current = false;
    }

    try {
      if (isConnected) {
        // Send via socket for real-time delivery
        sendSocketMessage(matchId, text, 'text');
        setSending(false); // Reset sending state for socket messages
      } else {
        // Fallback to REST API when socket is not connected
        const response = await dispatch(sendMessage({
          matchId,
          messageData: {
            content: text,
            message_type: 'text'
          }
        }));
        
        if (response.payload?.success) {
          scrollToBottom();
          setSending(false); // Reset sending state for API messages
        } else {
          throw new Error(response.payload?.message || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  // Handle typing
  const handleTextChange = (text) => {
    setMessageText(text);
    
    // Send typing indicator
    if (!isTypingRef.current && text.length > 0) {
      sendTypingIndicator(matchId, true);
      isTypingRef.current = true;
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTypingIndicator(matchId, false);
        isTypingRef.current = false;
      }
    }, 1000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message
  const renderMessage = ({ item: message, index }) => {
    const isFromCurrentUser = message.is_sent_by_me;
    const showAvatar = index === 0 || messages[index - 1]?.sender_user_id !== message.sender_user_id;
    
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={[
          styles.messageContainer,
          isFromCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
      >
        {!isFromCurrentUser && showAvatar && (
          <Image
            source={{
              uri: otherUser?.profile_photo_url || 
                   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
            }}
            style={styles.messageAvatar}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isFromCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatMessageTime(message.sent_at)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={styles.typingContainer}
      >
        <Image
          source={{
            uri: otherUser?.profile_photo_url || 
                 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
          }}
          style={styles.typingAvatar}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
        />
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>typing...</Text>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </Animated.View>
    );
  };

  // Render header
  const renderHeader = () => (
    <Animated.View 
      entering={FadeInDown.duration(600)}
      style={styles.header}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Image
        source={{
          uri: otherUser?.profile_photo_url || 
               'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        }}
        style={styles.headerAvatar}
        defaultSource={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
      />
      
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {otherUser?.first_name} {otherUser?.last_name}
        </Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          🐕 {otherDog?.name} & {match?.dog_one?.name}
        </Text>
      </View>
      
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <View style={styles.offlineDot} />
        </View>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
        
        {/* Message Input */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={messageText}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              editable={!sending}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
            >
              <Text style={[
                styles.sendButtonText,
                (!messageText.trim() || sending) && styles.sendButtonTextDisabled
              ]}>
                {sending ? '⏳' : '➤'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4F8EF7',
    fontWeight: 'bold',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  connectionStatus: {
    marginLeft: 12,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#4F8EF7',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTime: {
    color: '#E5E7EB',
  },
  otherUserTime: {
    color: '#9CA3AF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 1,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F8EF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ChatConversationScreen;
