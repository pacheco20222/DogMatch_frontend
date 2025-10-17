import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Surface, 
  Card, 
  Avatar, 
  Chip, 
  Button, 
  IconButton, 
  ActivityIndicator,
  Snackbar,
  Portal
} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchEvents, registerForEvent, unregisterFromEvent } from '../store/slices/eventsSlice';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const RegisterEventsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector(state => state.events);
  const [registering, setRegistering] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  const event = events?.find(e => e.id === eventId);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const loadEventDetails = async () => {
    try {
      await dispatch(fetchEvents());
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  useEffect(() => {
    loadEventDetails();
    // Animate header and content
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    contentOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [eventId]);

  // Show error snackbar when error occurs
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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
      'social': Colors.info[500],
      'educational': Colors.purple[500]
    };
    return colorMap[category] || Colors.primary[500];
  };

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);

      const response = await dispatch(registerForEvent({
        eventId,
        registrationData: {
          notes: '',
          special_requests: '',
          emergency_contact_name: '',
          emergency_contact_phone: ''
        }
      }));

      if (response.payload?.success) {
        Alert.alert(
          'Success!', 
          response.payload.message || 'Successfully registered for the event!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed', 
          response.payload?.message || 'Failed to register for the event. Please try again.'
        );
      }

    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert(
        'Registration Failed', 
        error.message || 'Failed to register for the event. Please try again.'
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;

    Alert.alert(
      'Unregister from Event',
      'Are you sure you want to unregister from this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            try {
              setRegistering(true);

              const response = await dispatch(unregisterFromEvent(eventId));

              if (response.payload?.success) {
                Alert.alert(
                  'Success!', 
                  'Successfully unregistered from the event.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Unregistration Failed', 
                  response.payload?.message || 'Failed to unregister from the event. Please try again.'
                );
              }

            } catch (error) {
              console.error('Error unregistering from event:', error);
              Alert.alert(
                'Unregistration Failed', 
                error.message || 'Failed to unregister from the event. Please try again.'
              );
            } finally {
              setRegistering(false);
            }
          }
        }
      ]
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading event details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <EmptyState
          icon="alert-circle"
          title="Error Loading Event"
          subtitle={error}
          actionText="Try Again"
          onActionPress={loadEventDetails}
        />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Event Registration</Text>
          <Text style={styles.subtitle}>Join this amazing event</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
          {/* Event Header Card */}
          <AnimatedCard variant="elevated" style={styles.eventHeaderCard}>
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

            {event.description && (
              <Text style={styles.eventDescription}>{event.description}</Text>
            )}
          </AnimatedCard>

          {/* Event Details Card */}
          <AnimatedCard variant="elevated" style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatEventDate(event.event_date)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            {event.duration_hours && (
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⏱️</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{event.duration_hours} hours</Text>
                </View>
              </View>
            )}

            {event.max_participants && (
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>👥</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>
                    {event.current_participants}/{event.max_participants} participants
                  </Text>
                </View>
              </View>
            )}

            {event.vaccination_required && (
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💉</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Requirements</Text>
                  <Text style={styles.detailValue}>Vaccination required</Text>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Additional Information */}
          {(event.additional_info || event.rules_and_guidelines) && (
            <AnimatedCard variant="elevated" style={styles.additionalCard}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              {event.additional_info && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Additional Info</Text>
                  <Text style={styles.infoText}>{event.additional_info}</Text>
                </View>
              )}

              {event.rules_and_guidelines && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Rules & Guidelines</Text>
                  <Text style={styles.infoText}>{event.rules_and_guidelines}</Text>
                </View>
              )}
            </AnimatedCard>
          )}

          {/* Registration Status */}
          <AnimatedCard variant="outlined" style={styles.statusCard}>
            <View style={styles.statusContent}>
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
                <Text style={styles.fullText}>Event is full</Text>
              )}
            </View>
          </AnimatedCard>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {event.is_registered ? (
              <AnimatedButton
                title="Unregister"
                onPress={handleUnregister}
                variant="outline"
                size="large"
                style={[styles.actionButton, styles.unregisterButton]}
                textStyle={styles.unregisterButtonText}
                loading={registering}
                disabled={registering}
              />
            ) : (
              <AnimatedButton
                title={event.is_registration_open ? "Register for Event" : "Registration Closed"}
                onPress={handleRegister}
                size="large"
                style={styles.actionButton}
                loading={registering}
                disabled={registering || !event.is_registration_open || event.is_full}
              />
            )}
          </View>
        </Animated.View>
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
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  eventHeaderCard: {
    marginBottom: Spacing.lg,
  },
  
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  
  categoryIcon: {
    width: 60,
    height: 60,
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
    fontSize: Typography.fontSize.xl,
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
  },
  
  detailsCard: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  detailIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
    width: 30,
  },
  
  detailContent: {
    flex: 1,
  },
  
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  
  detailValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  additionalCard: {
    marginBottom: Spacing.lg,
  },
  
  infoSection: {
    marginBottom: Spacing.lg,
  },
  
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  statusCard: {
    marginBottom: Spacing.lg,
  },
  
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  fullText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error[600],
  },
  
  actionButtons: {
    marginBottom: Spacing.xl,
  },
  
  actionButton: {
    marginBottom: Spacing.md,
  },
  
  unregisterButton: {
    borderColor: Colors.error[300],
  },
  
  unregisterButtonText: {
    color: Colors.error[600],
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  errorCard: {
    width: '100%',
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
  
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notFoundText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
  },
});

export default RegisterEventsScreen;
