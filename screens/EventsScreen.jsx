import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Card,
  Surface,
  FAB,
  Chip,
  Button,
  Avatar,
  ActivityIndicator,
  Snackbar,
  Portal,
  Badge,
} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchEvents, clearError } from '../store/slices/eventsSlice';
import { useAuth } from '../hooks/useAuth';
import { canCreateEvents } from '../utils/permissions';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const EventsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { events, loading, error } = useAppSelector(state => state.events);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Check if user can create events (admin or shelter only)
  const userCanCreateEvents = canCreateEvents(user);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const loadEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      await dispatch(fetchEvents()).unwrap();
    } catch (e) {
      setSnackbarVisible(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price, currency) => {
    if (price === 0 || price === '0') {
      return 'Free';
    }
    return `${currency} ${price}`;
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'meetup': 'Dog Meetup',
      'training': 'Training Workshop',
      'adoption': 'Adoption Fair',
      'competition': 'Dog Competition',
      'social': 'Social Event',
      'educational': 'Educational Workshop'
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'meetup': 'dog',
      'training': 'school',
      'adoption': 'home',
      'competition': 'trophy',
      'social': 'party-popper',
      'educational': 'book-open'
    };
    return iconMap[category] || 'calendar';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'meetup': Colors.primary[500],
      'training': Colors.secondary[500],
      'adoption': Colors.success[500],
      'competition': Colors.warning[500],
      'social': Colors.primary[600],
      'educational': Colors.secondary[600]
    };
    return colorMap[category] || Colors.primary[500];
  };

  const renderEventCard = (event, index) => (
    <Animated.View
      key={event.id}
      entering={FadeIn.delay(index * 100).duration(600)}
      layout={Layout.springify()}
    >
      <Card 
        mode="elevated" 
        style={styles.eventCard}
        onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
      >
        {/* Event Photo */}
        {event.photo_url && (
          <Card.Cover 
            source={{ 
              uri: event.photo_url.startsWith('http') 
                ? event.photo_url 
                : `https://dogmatch-backend.onrender.com${event.photo_url}`
            }} 
            style={styles.eventPhoto}
          />
        )}

        <Card.Content style={styles.cardContent}>
          {/* Event Header */}
          <View style={styles.eventHeader}>
            <Avatar.Icon
              size={48}
              icon={getCategoryIcon(event.category)}
              style={[styles.categoryAvatar, { backgroundColor: getCategoryColor(event.category) }]}
            />
            
            <View style={styles.eventInfo}>
              <Text variant="titleLarge" style={styles.eventTitle}>
                {event.title}
              </Text>
              <Chip 
                mode="outlined" 
                compact 
                icon={getCategoryIcon(event.category)}
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {getCategoryDisplayName(event.category)}
              </Chip>
              <Text variant="bodySmall" style={styles.eventOrganizer}>
                by {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
              </Text>
            </View>
            
            <Chip 
              mode="outlined" 
              compact 
              style={[
                styles.priceChip,
                { backgroundColor: event.price > 0 ? Colors.warning[50] : Colors.success[50] }
              ]}
              textStyle={[
                styles.priceChipText,
                { color: event.price > 0 ? Colors.warning[700] : Colors.success[700] }
              ]}
            >
              {formatPrice(event.price, event.currency)}
            </Chip>
          </View>

          {/* Event Description */}
          {event.description && (
            <View style={styles.descriptionContainer}>
              <Text variant="bodyMedium" style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            </View>
          )}

          {/* Event Details */}
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Avatar.Icon size={24} icon="calendar" style={styles.detailIcon} />
              <Text variant="bodySmall" style={styles.detailText}>
                {formatEventDate(event.event_date)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Avatar.Icon size={24} icon="map-marker" style={styles.detailIcon} />
              <Text variant="bodySmall" style={styles.detailText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
            
            {event.max_participants && (
              <View style={styles.detailRow}>
                <Avatar.Icon size={24} icon="account-group" style={styles.detailIcon} />
                <Text variant="bodySmall" style={styles.detailText}>
                  {event.current_participants}/{event.max_participants} participants
                </Text>
                {event.is_full && (
                  <Badge style={styles.fullBadge}>FULL</Badge>
                )}
              </View>
            )}
          </View>

          {/* Event Actions */}
          <View style={styles.eventActions}>
            <Chip 
              mode="outlined" 
              compact 
              icon={event.is_registered ? "check-circle" : (event.is_registration_open ? "calendar-plus" : "calendar-remove")}
              style={[
                styles.statusChip,
                { 
                  backgroundColor: event.is_registered 
                    ? Colors.primary[50] 
                    : (event.is_registration_open ? Colors.success[50] : Colors.error[50])
                }
              ]}
              textStyle={[
                styles.statusChipText,
                { 
                  color: event.is_registered 
                    ? Colors.primary[700] 
                    : (event.is_registration_open ? Colors.success[700] : Colors.error[700])
                }
              ]}
            >
              {event.is_registered ? 'Registered' : (event.is_registration_open ? 'Registration Open' : 'Registration Closed')}
            </Chip>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
              icon="arrow-right"
              style={styles.viewButton}
              compact
            >
              View Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading events...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <Surface style={styles.headerSurface} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.title}>
                Events
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Join community events and meetups
              </Text>
            </View>
            {userCanCreateEvents && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateEvent')}
                icon="plus"
                style={styles.createButton}
                compact
              >
                Create Event
              </Button>
            )}
          </View>
        </Surface>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEvents(true)}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {error ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <EmptyState
              icon="alert-circle"
              title="Oops! Something went wrong"
              subtitle={error}
              action={{
                label: "Try Again",
                onPress: () => loadEvents()
              }}
            />
          </Animated.View>
        ) : events.length === 0 ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <EmptyState
              icon="calendar"
              title="No events available"
              subtitle={userCanCreateEvents 
                ? 'Create your first event to get started!'
                : 'Check back soon for upcoming events in your area.'
              }
              action={userCanCreateEvents ? {
                label: "Create Event",
                onPress: () => navigation.navigate('CreateEvent')
              } : undefined}
            />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.eventsContainer, cardsAnimatedStyle]}>
            <View style={styles.eventsHeader}>
              <Text variant="titleMedium" style={styles.eventsCount}>
                {events.length} event{events.length !== 1 ? 's' : ''} available
              </Text>
            </View>
            {events.map((event, index) => renderEventCard(event, index))}
          </Animated.View>
        )}
      </ScrollView>

      {/* FAB for quick create */}
      {userCanCreateEvents && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEvent')}
          label="Create Event"
        />
      )}

      {/* Snackbar for errors */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || 'Something went wrong'}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  loadingText: {
    color: Colors.text.secondary,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  headerSurface: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    color: Colors.text.primary,
    marginBottom: -Spacing.xs,
  },
  
  subtitle: {
    color: Colors.text.secondary,
  },
  
  createButton: {
    borderRadius: BorderRadius.md,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  
  eventsContainer: {
    flex: 1,
  },
  
  eventsHeader: {
    marginBottom: Spacing.lg,
  },
  
  eventsCount: {
    color: Colors.text.primary,
  },
  
  eventCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  
  eventPhoto: {
    height: 200,
  },
  
  cardContent: {
    padding: Spacing.md,
  },
  
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  
  categoryAvatar: {
    backgroundColor: Colors.primary[500],
  },
  
  eventInfo: {
    flex: 1,
  },
  
  eventTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  categoryChip: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
    marginBottom: Spacing.xs,
  },
  
  categoryChipText: {
    color: Colors.primary[700],
    fontSize: Typography.fontSize.xs,
  },
  
  eventOrganizer: {
    color: Colors.text.tertiary,
  },
  
  priceChip: {
    borderColor: Colors.warning[200],
  },
  
  priceChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  descriptionContainer: {
    marginBottom: Spacing.md,
  },
  
  eventDescription: {
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  eventDetails: {
    marginBottom: Spacing.md,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  
  detailIcon: {
    backgroundColor: Colors.neutral[100],
  },
  
  detailText: {
    color: Colors.text.secondary,
    flex: 1,
  },
  
  fullBadge: {
    backgroundColor: Colors.error[500],
    color: Colors.background.primary,
  },
  
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  statusChip: {
    borderColor: Colors.primary[200],
  },
  
  statusChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  viewButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  
  fab: {
    position: 'absolute',
    margin: Spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary[500],
  },
});

export default EventsScreen;
