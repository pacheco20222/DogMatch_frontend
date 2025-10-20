import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { GlassCard } from '../glass';

const ChatListItem = React.memo(({ 
  conversation, 
  onPress,
  style 
}) => {
  const { isDark } = useTheme();

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getLastMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    if (message.message_type === 'image') {
      return '📷 Photo';
    } else if (message.message_type === 'location') {
      return '📍 Location';
    } else if (message.message_type === 'system') {
      return '🔔 System message';
    } else {
      return message.content || 'No messages yet';
    }
  };

  const getUnreadCount = () => {
    return conversation.unread_count || 0;
  };

  const isOnline = conversation.match?.other_dog?.owner?.is_online || false;
  const lastMessage = conversation.last_message;
  const otherUser = conversation.match?.other_dog?.owner;
  const unreadCount = getUnreadCount();
  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(conversation)}
      activeOpacity={0.7}
      className="mb-3 mx-4"
    >
      <GlassCard className="p-4">
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="relative mr-4">
            <Image
              source={{ 
                uri: otherUser?.profile_photo_url || 'https://via.placeholder.com/56x56?text=U' 
              }}
              className="w-14 h-14 rounded-full"
            />
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text 
                className={`text-base font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
                numberOfLines={1}
              >
                {otherUser?.username || 'Unknown User'}
              </Text>
              <Text 
                className={`text-xs ml-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {formatTime(lastMessage?.created_at)}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text 
                className={`text-sm flex-1 ${
                  hasUnread 
                    ? (isDark ? 'text-white font-medium' : 'text-gray-900 font-medium')
                    : (isDark ? 'text-gray-400' : 'text-gray-600')
                }`}
                numberOfLines={1}
              >
                {getLastMessagePreview(lastMessage)}
              </Text>
              
              {hasUnread && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <View className="ml-2 min-w-[22px] h-[22px] rounded-full bg-primary-500 items-center justify-center px-1.5">
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;
