import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button, Avatar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

const EventCard = ({ 
  event, 
  onPress, 
  onRegister, 
  onUnregister,
  showActions = true,
  style 
}) => {
  const theme = useTheme();

  const getCategoryColor = (category) => {
    switch (category) {
      case 'meetup':
        return theme.colors.primary;
      case 'training':
        return theme.colors.secondary;
      case 'adoption':
        return theme.colors.success;
      case 'competition':
        return theme.colors.warning;
      case 'social':
        return theme.colors.tertiary;
      case 'educational':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meetup':
        return 'account-group';
      case 'training':
        return 'school';
      case 'adoption':
        return 'heart';
      case 'competition':
        return 'trophy';
      case 'social':
        return 'party-popper';
      case 'educational':
        return 'book-open';
      default:
        return 'calendar';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isRegistered = event.user_registration;
  const isFull = event.registered_count >= event.capacity;
  const isPast = new Date(event.event_date) < new Date();

  return (
    <Card 
      mode="elevated" 
      style={[styles.card, style]}
      onPress={onPress}
    >
      <Card.Cover 
        source={{ uri: event.photo_url || 'https://via.placeholder.com/300x200?text=No+Photo' }}
        style={styles.cover}
      />
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.title}>
              {event.title}
            </Text>
            <View style={styles.categoryContainer}>
              <Avatar.Icon 
                icon={getCategoryIcon(event.category)} 
                size={24} 
                style={[styles.categoryIcon, { backgroundColor: getCategoryColor(event.category) }]}
              />
              <Chip 
                mode="outlined" 
                compact
                style={[styles.categoryChip, { borderColor: getCategoryColor(event.category) }]}
                textStyle={{ color: getCategoryColor(event.category) }}
              >
                {event.category?.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Avatar.Icon icon="calendar" size={20} style={styles.detailIcon} />
            <Text variant="bodySmall" style={styles.detailText}>
              {formatDate(event.event_date)} at {formatTime(event.start_time)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Avatar.Icon icon="map-marker" size={20} style={styles.detailIcon} />
            <Text variant="bodySmall" style={styles.detailText}>
              {event.location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Avatar.Icon icon="account-group" size={20} style={styles.detailIcon} />
            <Text variant="bodySmall" style={styles.detailText}>
              {event.registered_count}/{event.capacity} registered
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text variant="titleMedium" style={styles.price}>
              {event.price === 0 ? 'FREE' : `$${event.price}`}
            </Text>
          </View>
          
          {showActions && !isPast && (
            <View style={styles.actionContainer}>
              {isRegistered ? (
                <Button 
                  mode="outlined" 
                  onPress={() => onUnregister?.(event)}
                  style={styles.actionButton}
                >
                  Unregister
                </Button>
              ) : (
                <Button 
                  mode="contained" 
                  onPress={() => onRegister?.(event)}
                  disabled={isFull}
                  style={styles.actionButton}
                >
                  {isFull ? 'Full' : 'Register'}
                </Button>
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    minHeight: 320,
  },
  cover: {
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryChip: {
    marginRight: 6,
  },
  description: {
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  detailText: {
    flex: 1,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontWeight: '600',
    color: '#0EA5E9',
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionButton: {
    minWidth: 100,
  },
});

export default EventCard;
