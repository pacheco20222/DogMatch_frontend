import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { canCreateEvents } from '../utils/permissions';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const EventsScreen = ({ navigation }) => {
  const { user, accessToken } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Check if user can create events (admin or shelter only)
  const userCanCreateEvents = canCreateEvents(user);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const fetchEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await apiFetch('/api/events', {
        method: 'GET',
        token: accessToken
      });
      
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

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
      'meetup': '🐕',
      'training': '🎓',
      'adoption': '🏠',
      'competition': '🏆',
      'social': '🎉',
      'educational': '📚'
    };
    return iconMap[category] || '📅';
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
      <AnimatedCard
        variant="elevated"
        style={styles.eventCard}
        onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
      >
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(event.category) }]}>
            <Text style={styles.categoryEmoji}>{getCategoryIcon(event.category)}</Text>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventCategory}>{getCategoryDisplayName(event.category)}</Text>
            <Text style={styles.eventOrganizer}>
              by {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
            </Text>
          </View>
          
          <View style={[
            styles.priceBadge,
            { backgroundColor: event.price > 0 ? Colors.warning[100] : Colors.success[100] }
          ]}>
            <Text style={[
              styles.priceText,
              { color: event.price > 0 ? Colors.warning[700] : Colors.success[700] }
            ]}>
              {formatPrice(event.price, event.currency)}
            </Text>
          </View>
        </View>

        {/* Event Description */}
        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatEventDate(event.event_date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText} numberOfLines={1}>{event.location}</Text>
          </View>
          
          {event.max_participants && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>
                {event.current_participants}/{event.max_participants} participants
              </Text>
            </View>
          )}
        </View>

        {/* Event Status */}
        <View style={styles.eventFooter}>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: event.is_registered 
                ? Colors.primary[100] 
                : (event.is_registration_open ? Colors.success[100] : Colors.error[100])
            }
          ]}>
            <Text style={[
              styles.statusText,
              { 
                color: event.is_registered 
                  ? Colors.primary[700] 
                  : (event.is_registration_open ? Colors.success[700] : Colors.error[700])
              }
            ]}>
              {event.is_registered ? 'Registered' : (event.is_registration_open ? 'Registration Open' : 'Registration Closed')}
            </Text>
          </View>
          
          {event.is_full && !event.is_registered && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullText}>FULL</Text>
            </View>
          )}
        </View>
      </AnimatedCard>
    </Animated.View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading events..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Join community events and meetups</Text>
        </View>
        {userCanCreateEvents && (
          <AnimatedButton
            title="Create Event"
            onPress={() => navigation.navigate('CreateEvent')}
            size="medium"
            style={styles.createButton}
          />
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {error ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <AnimatedCard variant="outlined" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Text style={styles.errorEmoji}>😔</Text>
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <Text style={styles.errorText}>{error}</Text>
                <AnimatedButton
                  title="Try Again"
                  onPress={() => fetchEvents()}
                  variant="outline"
                  size="medium"
                  style={styles.retryButton}
                />
              </View>
            </AnimatedCard>
          </Animated.View>
        ) : events.length === 0 ? (
          <Animated.View entering={FadeIn.duration(600)}>
            <AnimatedCard variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyEmoji}>📅</Text>
                </View>
                <Text style={styles.emptyTitle}>No events available</Text>
                <Text style={styles.emptySubtitle}>
                  {userCanCreateEvents 
                    ? 'Create your first event to get started!'
                    : 'Check back soon for upcoming events in your area.'
                  }
                </Text>
                {userCanCreateEvents && (
                  <AnimatedButton
                    title="Create Event"
                    onPress={() => navigation.navigate('CreateEvent')}
                    size="large"
                    style={styles.createEventButton}
                  />
                )}
              </View>
            </AnimatedCard>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.eventsContainer, cardsAnimatedStyle]}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsCount}>
                {events.length} event{events.length !== 1 ? 's' : ''} available
              </Text>
            </View>
            {events.map((event, index) => renderEventCard(event, index))}
          </Animated.View>
        )}
      </ScrollView>
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
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: -Spacing.xs,
  },
  
  createButton: {
    paddingHorizontal: Spacing.lg,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  eventsContainer: {
    flex: 1,
  },
  
  eventsHeader: {
    marginBottom: Spacing.lg,
  },
  
  eventsCount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  eventCard: {
    marginBottom: Spacing.lg,
  },
  
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  categoryEmoji: {
    fontSize: Typography.fontSize.xl,
  },
  
  eventInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  
  eventTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  eventCategory: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  
  eventOrganizer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  
  priceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  priceText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  eventDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  
  eventDetails: {
    marginBottom: Spacing.md,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  detailIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.sm,
    width: 20,
  },
  
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  fullBadge: {
    backgroundColor: Colors.error[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  fullText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error[700],
  },
  
  errorCard: {
    marginVertical: Spacing.lg,
  },
  
  errorContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  errorEmoji: {
    fontSize: Typography.fontSize['4xl'],
    marginBottom: Spacing.lg,
  },
  
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  
  emptyCard: {
    marginVertical: Spacing.lg,
  },
  
  emptyContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  emptyEmoji: {
    fontSize: 64,
  },
  
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  createEventButton: {
    paddingHorizontal: Spacing.xl,
  },
});

export default EventsScreen;
