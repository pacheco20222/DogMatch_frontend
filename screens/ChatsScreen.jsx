import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Surface, FAB, List, Badge, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchConversations } from '../store/slices/chatsSlice';
import { useChatService } from '../services/chatService';
import ChatListItem from '../components/ui/ChatListItem';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { FadeIn, FadeInDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const ChatsScreen = ({ navigation }) => {
  const { accessToken } = useAuth();
  const { isConnected, connectionError, reconnect, connect } = useSocket();
  const chatService = useChatService();
  const dispatch = useAppDispatch();
  const { conversations, loading, error } = useAppSelector(state => state.chats);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch conversations from API
  const loadConversations = useCallback(async () => {
    try {
      await dispatch(fetchConversations());
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [dispatch]);

  // Load conversations on mount and focus
  useFocusEffect(
    useCallback(() => {
      // Only load if not already loading and not already loaded
      if (!loading && !hasLoadedRef.current) {
        console.log('🔌 ChatsScreen: Loading conversations');
        hasLoadedRef.current = true;
        loadConversations().finally(() => {
          setIsInitializing(false);
        });
      } else if (hasLoadedRef.current) {
        // If already loaded, just set initializing to false
        setIsInitializing(false);
      }
      
      // Ensure socket is connected when entering chats
      if (!isConnected) {
        console.log('🔌 ChatsScreen: Socket not connected, attempting to connect');
        connect();
      }
    }, [loading, isConnected, loadConversations, connect])
  );

  // Socket listeners are now handled by Redux middleware
  // Real-time updates are managed through Redux state

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hasLoadedRef.current = false; // Reset the ref to allow reloading
    setIsInitializing(true); // Reset initialization state
    loadConversations().finally(() => {
      setIsInitializing(false);
    });
  }, [loadConversations]);

  // Handle conversation tap
  const handleConversationPress = (conversation) => {
    navigation.navigate('ChatConversation', {
      matchId: conversation.match.id,
      otherUser: conversation.match.other_dog?.owner,
      otherDog: conversation.match.other_dog,
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
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <ChatListItem
        conversation={conversation}
        onPress={() => handleConversationPress(conversation)}
        style={styles.conversationItem}
      />
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(800)} style={styles.emptyState}>
      <EmptyState
        icon="message-outline"
        title="No conversations yet"
        description="Start swiping to find matches and begin chatting!"
        actionLabel="Start Swiping"
        onAction={() => navigation.navigate('Discover')}
      />
    </Animated.View>
  );

  // Render error state
  const renderErrorState = () => (
    <Animated.View entering={FadeIn.duration(800)} style={styles.errorState}>
      <EmptyState
        icon="alert-circle"
        title="Failed to load conversations"
        description={error}
        actionLabel="Try Again"
        onAction={fetchConversations}
      />
    </Animated.View>
  );

  if (loading || isInitializing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerRight}>
            {!isConnected && (
              <View style={styles.connectionStatus}>
                <Avatar.Icon icon="wifi-off" size={20} style={styles.offlineIcon} />
                <Text variant="bodySmall" style={styles.connectionText}>Offline</Text>
                <IconButton
                  icon="wifi"
                  size={20}
                  onPress={connect}
                  style={styles.connectButton}
                />
              </View>
            )}
            <IconButton
              icon="refresh"
              size={24}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
          </View>
        </View>
      </Surface>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : conversations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.match.id.toString()}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineIcon: {
    backgroundColor: '#EF4444',
  },
  refreshButton: {
    margin: 0,
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
  connectButton: {
    marginLeft: 8,
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
