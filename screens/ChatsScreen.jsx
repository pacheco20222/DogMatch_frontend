import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { useSocket } from '../auth/SocketContext';
import { apiFetch } from '../api/client';
import chatService from '../services/chatService';
import { FadeIn, FadeInDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const ChatsScreen = ({ navigation }) => {
  const { accessToken } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await apiFetch('/api/messages/conversations', {
        token: accessToken
      });
      
      if (response.success) {
        setConversations(response.conversations || []);
      } else {
        setError(response.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  // Load conversations on mount and focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // Setup socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (messageData) => {
      // Update conversations list with new message
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.match_id === messageData.match_id) {
            return {
              ...conversation,
              last_message: messageData,
              last_message_at: messageData.sent_at,
              unread_count: messageData.is_from_current_user 
                ? conversation.unread_count 
                : (conversation.unread_count || 0) + 1
            };
          }
          return conversation;
        });
      });
    };

    const handleMessageRead = (readData) => {
      // Update read status for messages
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.match_id === readData.match_id) {
            return {
              ...conversation,
              unread_count: 0 // Reset unread count when messages are read
            };
          }
          return conversation;
        });
      });
    };

    // Setup socket listeners
    chatService.setupSocketListeners(socket, {
      onNewMessage: handleNewMessage,
      onMessageRead: handleMessageRead
    });

    return () => {
      // Cleanup listeners if needed
    };
  }, [socket, isConnected]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  // Handle conversation tap
  const handleConversationPress = (conversation) => {
    navigation.navigate('ChatConversation', {
      matchId: conversation.match_id,
      otherUser: conversation.other_user,
      otherDog: conversation.other_dog,
      match: conversation.match
    });
  };

  // Format last message preview
  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const maxLength = 50;
    let preview = message.content;
    
    if (message.message_type === 'image') {
      preview = '📷 Photo';
    } else if (message.message_type === 'location') {
      preview = '📍 Location';
    }
    
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength) + '...';
    }
    
    return preview;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Render conversation item
  const renderConversation = ({ item: conversation, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={styles.conversationItem}
    >
      <TouchableOpacity
        style={styles.conversationTouchable}
        onPress={() => handleConversationPress(conversation)}
        activeOpacity={0.7}
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: conversation.other_user?.profile_photo_url || 
                   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
            }}
            style={styles.avatar}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
          />
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {conversation.other_user?.first_name} {conversation.other_user?.last_name}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(conversation.last_message_at)}
            </Text>
          </View>
          
          <View style={styles.conversationPreview}>
            <Text 
              style={[
                styles.lastMessage,
                conversation.unread_count > 0 && styles.unreadMessage
              ]} 
              numberOfLines={1}
            >
              {formatLastMessage(conversation.last_message)}
            </Text>
            {conversation.unread_count > 0 && (
              <View style={styles.unreadDot} />
            )}
          </View>
          
          <Text style={styles.dogName} numberOfLines={1}>
            🐕 {conversation.other_dog?.name} & {conversation.match?.dog_one?.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.emptyState}
    >
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start swiping to find matches and begin chatting!
      </Text>
    </Animated.View>
  );

  // Render error state
  const renderErrorState = () => (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.errorState}
    >
      <Text style={styles.errorStateIcon}>⚠️</Text>
      <Text style={styles.errorStateTitle}>Failed to load conversations</Text>
      <Text style={styles.errorStateSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchConversations}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          {!isConnected && (
            <View style={styles.connectionStatus}>
              <View style={styles.offlineDot} />
              <Text style={styles.connectionText}>Offline</Text>
            </View>
          )}
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        {!isConnected && (
          <View style={styles.connectionStatus}>
            <View style={styles.offlineDot} />
            <Text style={styles.connectionText}>Offline</Text>
          </View>
        )}
      </View>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : conversations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.match_id.toString()}
          renderItem={renderConversation}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F8EF7"
              colors={['#4F8EF7']}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conversationTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  conversationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadMessage: {
    color: '#1F2937',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F8EF7',
    marginLeft: 8,
  },
  dogName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default ChatsScreen;
