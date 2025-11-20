import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMessages, sendMessage, markMessageAsRead } from '../store/slices/chatsSlice';
import { useChatService } from '../services/chatService';
import { apiFetch } from '../api/client';
import { store } from '../store';
import { logger } from '../utils/logger';
import { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';

const { width: screenWidth } = Dimensions.get('window');

const ChatConversationScreen = ({ navigation, route }) => {
  const { matchId, otherUser: initialOtherUser, otherDog: initialOtherDog, match: initialMatch } = route.params;
  const { user } = useAuth();
  
  // State for match data (may be updated from API)
  const [matchData, setMatchData] = useState(initialMatch);
  const [otherUser, setOtherUser] = useState(initialOtherUser);
  const [otherDog, setOtherDog] = useState(initialOtherDog);
  
  // Get current user's profile photo URL
  const currentUserProfilePhoto = user?.profile_photo_url;
  const { isConnected, joinMatch, leaveMatch, sendMessage: sendSocketMessage, sendTypingIndicator } = useSocket();
  
  // DEBUG: Log socket connection state
  console.log('🔌🔌🔌 ChatConversationScreen: isConnected =', isConnected);
  
  const chatService = useChatService();
  const dispatch = useAppDispatch();
  const { messages: reduxMessages, loading, error } = useAppSelector(state => state.chats);
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const styles = React.useMemo(() => createStyles(tokens), [isDark]);
  // Ensure we use string keys to match Redux storage (socket payloads use numeric IDs, store keys are strings)
  const messagesKey = String(matchId);
  const messages = reduxMessages[messagesKey] || [];
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Load match data and messages on mount
  useFocusEffect(
    useCallback(() => {
      loadMatchData();
      loadMessages();
      
      // Mark all messages as read when entering the chat
      markAllMessagesAsRead();
      
      return () => {
        // Mark all messages as read before leaving
        markAllMessagesAsRead();
      };
    }, [matchId])
  );

  // Load fresh match data to ensure profile photos are included
  const loadMatchData = async () => {
    try {
      const state = store.getState();
      const accessToken = state.auth.accessToken;
      
      if (!accessToken) {
        logger.warn('No access token available for loading match data');
        return;
      }
      
      const response = await apiFetch(`/api/matches/${matchId}`, {
        token: accessToken,
      });
      
      if (response.match) {
        // Get current user ID at the start
        const currentUserId = user?.id;
        
        // Check all possible paths for the owner data
        const otherDog = response.match.other_dog;
        const owner = otherDog?.owner;
        
        // Also check dog_one and dog_two directly - they might have the owner data
        const dogOne = response.match.dog_one;
        const dogTwo = response.match.dog_two;
        
        // Determine which dog is the "other" dog and get its owner
        let finalOwner = owner;
        let finalOtherDog = otherDog;
        
        // If other_dog doesn't have owner or profile photo, try to find it from dog_one or dog_two
        if (!finalOwner || !finalOwner.profile_photo_url) {
          // Check if we can identify the other dog from dog_one or dog_two
          if (dogOne && dogOne.owner?.id !== currentUserId && dogOne.owner?.profile_photo_url) {
            finalOwner = dogOne.owner;
            finalOtherDog = dogOne;
          } else if (dogTwo && dogTwo.owner?.id !== currentUserId && dogTwo.owner?.profile_photo_url) {
            finalOwner = dogTwo.owner;
            finalOtherDog = dogTwo;
          }
        }
        
        setMatchData(response.match);
        setOtherUser(finalOwner || owner);
        setOtherDog(finalOtherDog || otherDog);
      }
    } catch (error) {
      logger.error('Error loading match data:', error);
      // Use initial data if API call fails
    }
  };

  // Handle socket connection changes
  useEffect(() => {
    console.log('🔌🔌🔌 Socket connection effect running, isConnected:', isConnected);
    
    // If not connected, try to connect
    if (!isConnected) {
      console.log('🔌🔌🔌 Socket NOT connected, dispatching connect action');
      dispatch({ type: 'socket/connect' });
    } else {
      logger.log('🔌 ChatConversationScreen: Socket connected, joining match room', matchId);
      joinMatch(matchId);
    }
    
    return () => {
      // Leave match room when component unmounts
      if (isConnected) {
        logger.log('🔌 ChatConversationScreen: Component unmounting, leaving match room', matchId);
        leaveMatch(matchId);
      }
    };
  }, [isConnected, matchId, dispatch]); // Remove joinMatch and leaveMatch from dependencies

  // Socket listeners are now handled by Redux middleware
  // Real-time updates are managed through Redux state

  // Load messages from API
  const loadMessages = async () => {
    try {
      await dispatch(fetchMessages(matchId));
      scrollToBottom();
    } catch (error) {
      logger.error('Error loading messages:', error);
    }
  };

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    try {
      logger.log('📖 Marking all messages as read for match', matchId);
      
      // Get current messages and mark unread ones as read
      const currentMessages = messages.filter(msg => 
        !msg.is_sent_by_me && !msg.is_read
      );
      
      // Mark each unread message as read
      for (const message of currentMessages) {
        try {
          await dispatch(markMessageAsRead(message.id));
        } catch (error) {
          logger.error('Error marking message as read:', error);
        }
      }
      
      logger.log('✅ All messages marked as read for match', matchId);
    } catch (error) {
      logger.error('Error marking messages as read:', error);
    }
  };

  // Mark a single message as read
  const markSingleMessageAsRead = async (messageId) => {
    try {
      await dispatch(markMessageAsRead(messageId));
      // Redux state will be updated by the slice; no local state update required
    } catch (error) {
      logger.error('Error marking message as read:', error);
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
        
        // Check if the action was successful (Redux Toolkit pattern)
        if (sendMessage.fulfilled.match(response)) {
          scrollToBottom();
          setSending(false);
        } else {
          // Action was rejected
          throw new Error(response.error?.message || response.payload || 'Failed to send message');
        }
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      setSending(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
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

  // Memoize profile photo URLs to avoid recalculating on every render
  const currentUserPhotoUri = useMemo(() => 
    currentUserProfilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    [currentUserProfilePhoto]
  );
  
  const otherUserPhotoUri = useMemo(() => 
    otherUser?.profile_photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    [otherUser?.profile_photo_url]
  );
  
  // Memoized message renderer for better performance
  const renderMessage = useCallback(({ item: message, index }) => {
    const isFromCurrentUser = message.is_sent_by_me;
    const showAvatar = true; // Show avatar for both users
    
    const avatar = showAvatar ? (
      <Image
        source={{
          uri: isFromCurrentUser ? currentUserPhotoUri : otherUserPhotoUri
        }}
        style={[
          styles.messageAvatar,
          isFromCurrentUser ? styles.currentUserAvatar : styles.otherUserAvatar
        ]}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
    ) : null;
    
    const messageBubble = (
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
    );
    
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={[
          styles.messageContainer,
          isFromCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
      >
        {isFromCurrentUser ? (
          // Current user: message bubble first, then avatar
          <>
            {messageBubble}
            {avatar}
          </>
        ) : (
          // Other user: avatar first, then message bubble
          <>
            {avatar}
            {messageBubble}
          </>
        )}
      </Animated.View>
    );
  }, [currentUserPhotoUri, otherUserPhotoUri]);

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
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
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
      style={[styles.header, isDark && styles.headerDark]}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>←</Text>
      </TouchableOpacity>
      
      <Image
        source={{
          uri: otherUser?.profile_photo_url || 
               'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        }}
        style={styles.headerAvatar}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
          {otherUser?.first_name} {otherUser?.last_name}
        </Text>
        <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]} numberOfLines={1}>
          🐕 {otherDog?.name} & {matchData?.my_dog?.name}
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item?.id?.toString() || `temp-${Date.now()}-${Math.random()}`}
          renderItem={renderMessage}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 80, // Approximate message height
            offset: 80 * index,
            index,
          })}
        />
        
        {/* Message Input */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={[styles.inputContainer, isDark && styles.inputContainerDark]}
        >
          <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
            <TextInput
              style={[styles.textInput, isDark && styles.textInputDark]}
              value={messageText}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
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
    </View>
  );
};

function createStyles(tokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.background,
    },
    containerDark: {
      backgroundColor: tokens.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.spacingLarge,
      paddingVertical: tokens.spacing,
      paddingTop: 50,
      borderBottomWidth: 1,
      borderBottomColor: tokens.headerBorder,
      backgroundColor: tokens.headerBackground,
    },
    headerDark: {
      backgroundColor: tokens.headerBackground,
      borderBottomColor: tokens.headerBorder,
    },
    backButton: {
      marginRight: 12,
      padding: 8,
    },
    backButtonText: {
      fontSize: 24,
      color: tokens.primaryVariant,
      fontWeight: 'bold',
    },
    backButtonTextDark: {
      color: tokens.primary,
    },
    headerAvatar: {
      width: tokens.avatarSize,
      height: tokens.avatarSize,
      borderRadius: tokens.avatarSize / 2,
      marginRight: 12,
      backgroundColor: tokens.avatarBackground,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: tokens.fontSizeLg,
      fontWeight: '600',
      color: tokens.textPrimary,
    },
    headerTitleDark: {
      color: tokens.textPrimary,
    },
    headerSubtitle: {
      fontSize: tokens.fontSizeSm,
      color: tokens.textSecondary,
      marginTop: 2,
    },
    headerSubtitleDark: {
      color: tokens.textSecondary,
    },
    connectionStatus: {
      marginLeft: 12,
    },
    offlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: tokens.danger,
    },
    chatContainer: {
      flex: 1,
    },
    messagesList: {
      paddingHorizontal: tokens.spacingLarge,
      paddingVertical: tokens.spacing,
      paddingBottom: tokens.spacingLarge, // Reduced padding since tab bar is hidden
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
      backgroundColor: tokens.avatarBackground,
    },
    currentUserAvatar: {
      marginLeft: 8, // Avatar on right side for current user
      marginRight: 0,
    },
    otherUserAvatar: {
      marginRight: 8, // Avatar on left side for other user
      marginLeft: 0,
    },
    messageBubble: {
      maxWidth: screenWidth * 0.75,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
    },
    currentUserBubble: {
      backgroundColor: tokens.bubbleOutgoing,
      borderBottomRightRadius: 4,
    },
    otherUserBubble: {
      backgroundColor: tokens.bubbleIncoming,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: tokens.fontSizeBase,
      lineHeight: 20,
    },
    currentUserText: {
      color: tokens.primaryContrast,
    },
    otherUserText: {
      color: tokens.textPrimary,
    },
    messageTime: {
      fontSize: 12,
      marginTop: 4,
    },
    currentUserTime: {
      color: tokens.subtle,
    },
    otherUserTime: {
      color: tokens.muted,
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
      backgroundColor: tokens.avatarBackground,
    },
    typingBubble: {
      backgroundColor: tokens.bubbleIncoming,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      borderBottomLeftRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingText: {
      fontSize: tokens.fontSizeBase,
      color: tokens.textSecondary,
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
      backgroundColor: tokens.muted,
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
      paddingHorizontal: tokens.spacingLarge,
      paddingVertical: tokens.spacing,
      paddingBottom: tokens.spacing,
      borderTopWidth: 1,
      borderTopColor: tokens.headerBorder,
      backgroundColor: tokens.surface,
    },
    inputContainerDark: {
      backgroundColor: tokens.headerBackground,
      borderTopColor: tokens.headerBorder,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: tokens.inputBackground,
      borderRadius: tokens.borderRadius,
      paddingHorizontal: tokens.spacingLarge,
      paddingVertical: tokens.spacing,
      borderWidth: 1,
      borderColor: tokens.inputBorder,
    },
    inputWrapperDark: {
      backgroundColor: tokens.inputBackground,
      borderColor: tokens.inputBorder,
    },
    textInput: {
      flex: 1,
      fontSize: tokens.fontSizeBase,
      color: tokens.inputText,
      maxHeight: 100,
      paddingVertical: 8,
    },
    textInputDark: {
      color: tokens.inputText,
    },
    sendButton: {
      marginLeft: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: tokens.primaryVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
      fontSize: 16,
      color: tokens.primaryContrast,
      fontWeight: 'bold',
    },
    sendButtonTextDisabled: {
      color: tokens.muted,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: tokens.fontSizeBase,
      color: tokens.muted,
    },
  });
}

export default ChatConversationScreen;
