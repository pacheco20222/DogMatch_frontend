import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Avatar, Badge, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const ChatListItem = React.memo(({ 
  conversation, 
  onPress,
  style 
}) => {
  const theme = useTheme();

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

  return (
    <List.Item
      title={otherUser?.username || 'Unknown User'}
      description={getLastMessagePreview(lastMessage)}
      left={(props) => (
        <View style={styles.avatarContainer}>
          <Avatar.Image
            {...props}
            size={50}
            source={{ 
              uri: otherUser?.profile_photo_url || 'https://via.placeholder.com/50x50?text=U' 
            }}
          />
          {isOnline && (
            <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.success }]} />
          )}
        </View>
      )}
      right={(props) => (
        <View style={styles.rightContainer}>
          <Text variant="bodySmall" style={styles.timeText}>
            {formatTime(lastMessage?.created_at)}
          </Text>
          {getUnreadCount() > 0 && (
            <Badge 
              size={20} 
              style={[styles.badge, { backgroundColor: theme.colors.primary }]}
            >
              {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
            </Badge>
          )}
        </View>
      )}
      onPress={() => onPress?.(conversation)}
      style={[styles.listItem, style]}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      descriptionNumberOfLines={1}
    />
  );
});

ChatListItem.displayName = 'ChatListItem';

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  timeText: {
    color: '#666',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-end',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  description: {
    color: '#666',
    fontSize: 14,
  },
});

export default ChatListItem;
