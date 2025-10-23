import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, RefreshCw, WifiOff, Wifi } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchConversations } from '../store/slices/chatsSlice';
import { useChatService } from '../services/chatService';
import { useTheme } from '../theme/ThemeContext';
import ChatListItem from '../components/ui/ChatListItem';
import EmptyState from '../components/ui/EmptyState';
import { GlassCard } from '../components/glass';

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


  // Render conversation item
  const renderConversation = ({ item: conversation, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <ChatListItem
        conversation={conversation}
        onPress={() => handleConversationPress(conversation)}
      />
    </Animated.View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View 
        entering={FadeIn.duration(600)}
        className="items-center"
      >
        {/* Icon */}
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
          isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'
        }`}>
          <MessageCircle size={48} color={isDark ? '#818CF8' : '#6366F1'} />
        </View>

        {/* Title */}
        <Text className={`text-2xl font-bold text-center mb-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          No conversations yet
        </Text>

        {/* Description */}
        <Text className={`text-base text-center mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Check your matches to start chatting with dogs you've connected with!
        </Text>

        {/* Action Buttons */}
        <View className="w-full max-w-sm gap-3">
          {/* View Matches Button (Primary) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Discover', { screen: 'Matches' })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-8 py-4 rounded-2xl"
            >
              <Text className="text-white text-center text-lg font-bold">
                View Matches
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Start Swiping Button (Secondary) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Discover')}
            className={`px-8 py-4 rounded-2xl border-2 ${
              isDark ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white'
            }`}
            activeOpacity={0.8}
          >
            <Text className={`text-center text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Start Swiping
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <EmptyState
      icon="alert-circle"
      title="Failed to load conversations"
      description={error}
      actionLabel="Try Again"
      onAction={() => dispatch(fetchConversations())}
    />
  );

  const { isDark } = useTheme();

  if (loading || isInitializing) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={isDark 
            ? ['#312E81', '#1E293B', '#0F172A'] 
            : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
          }
          className="absolute top-0 left-0 right-0 h-64"
        />

        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Header */}
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="px-6 py-6 flex-row items-center justify-between"
          >
            <View>
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Chats
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Stay connected
              </Text>
            </View>
          </Animated.View>

          {/* Loading State */}
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading conversations...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark 
          ? ['#312E81', '#1E293B', '#0F172A'] 
          : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
        }
        className="absolute top-0 left-0 right-0 h-64"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.duration(400)}
          className="px-6 py-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Chats
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
              </Text>
            </View>

            {/* Header Actions */}
            <View className="flex-row items-center gap-2">
              {/* Connection Status */}
              {!isConnected && (
                <TouchableOpacity
                  onPress={connect}
                  className={`px-3 py-2 rounded-full flex-row items-center ${
                    isDark ? 'bg-red-500/20' : 'bg-red-100'
                  }`}
                  activeOpacity={0.7}
                >
                  <WifiOff size={16} className="text-red-500" />
                  <Text className="text-red-500 text-xs font-semibold ml-1.5">Offline</Text>
                </TouchableOpacity>
              )}

              {/* Refresh Button */}
              <TouchableOpacity
                onPress={onRefresh}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? 'bg-white/10' : 'bg-white/70'
                }`}
                activeOpacity={0.7}
              >
                <RefreshCw size={20} className={isDark ? 'text-white' : 'text-gray-900'} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

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
                tintColor="#6366F1"
                colors={['#6366F1']}
              />
            }
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};


export default ChatsScreen;
