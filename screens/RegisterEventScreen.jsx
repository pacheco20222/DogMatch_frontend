import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react-native';
import { Trash } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchEvents, registerForEvent, unregisterFromEvent } from '../store/slices/eventsSlice';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';
import { logger } from '../utils/logger';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';
import { apiFetch } from '../api/client';
import { getTokens } from '../auth/storage';

const RegisterEventScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { events, loading, error } = useAppSelector(state => state.events);
  const [registering, setRegistering] = useState(false);
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const insets = useSafeAreaInsets();
  // Extra bottom padding to ensure action button is visible above tab bar on various devices
  const EXTRA_BOTTOM = (insets.bottom || 0) + 120;
  
  const event = events?.find(e => e.id === eventId);

  const loadEventDetails = async () => {
    try {
      await dispatch(fetchEvents());
    } catch (error) {
      logger.error('Error fetching event details:', error);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

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
    return `${currency || 'MXN'} ${price}`;
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
      // Check asyncThunk result status (fulfilled vs rejected)
      if (response?.meta?.requestStatus === 'fulfilled') {
        Alert.alert(
          'Success!',
          response.payload?.message || 'Successfully registered for the event!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        // Try to show backend message if available, otherwise generic
        const errMsg = response?.payload || response?.error?.message || 'Failed to register for the event. Please try again.';
        Alert.alert('Registration Failed', typeof errMsg === 'string' ? errMsg : (errMsg.message || 'Failed to register for the event.'));
      }

    } catch (error) {
      logger.error('Error registering for event:', error);
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

              if (response?.meta?.requestStatus === 'fulfilled') {
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
                const errMsg = response?.payload || response?.error?.message || 'Failed to unregister from the event. Please try again.';
                Alert.alert('Unregistration Failed', typeof errMsg === 'string' ? errMsg : (errMsg.message || 'Failed to unregister from the event.'));
              }

            } catch (error) {
              logger.error('Error unregistering from event:', error);
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

  // Admin-only: delete/cancel event
  const handleDeleteEvent = async () => {
    if (!event) return;
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This action can be performed by admins only.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const tokens = await getTokens();
              const access = tokens?.access;

              if (!access) {
                Alert.alert('Not authenticated', 'Please login as admin to perform this action.');
                return;
              }

              const response = await apiFetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                token: access,
              });

              Alert.alert('Success', response.message || 'Event cancelled');
              // Refresh events list and go back
              try { await dispatch(fetchEvents()); } catch (e) {}
              navigation.goBack();
            } catch (error) {
              console.error('Delete event error', error);
              Alert.alert('Error', error.message || 'Failed to cancel event');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <ActivityIndicator size="large" color={tokens.textPrimary} />
        <Text className={`mt-4 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Loading event details...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <View className="px-6 pt-4 pb-3 flex-row items-center" style={{ paddingTop: insets.top + 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Event Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Event Not Found
          </Text>
          <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This event could not be found or no longer exists.
          </Text>
          <GlassButton onPress={() => navigation.goBack()} className="mt-6">
            Go Back
          </GlassButton>
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Header with iPhone notch support */}
      <View className="px-6 pt-4 pb-3 flex-row items-center" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Event Registration
        </Text>
        {/* Admin-only delete button on header */}
        {user?.user_type === 'admin' && (
          <TouchableOpacity
            onPress={() => handleDeleteEvent()}
            className="ml-auto"
            style={{ marginLeft: 12 }}
            activeOpacity={0.8}
          >
            <Trash size={20} color={isDark ? '#F87171' : '#B91C1C'} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: EXTRA_BOTTOM }}
        showsVerticalScrollIndicator={false}
        // allow the content to grow so small differences in tab height won't clip the last element
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <GlassCard className="mb-6" style={{ paddingBottom: 16 }}>
            <View className="flex-row items-start">
              <View className="flex-1">
                <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {event.title}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Text className="text-3xl mr-2">{getCategoryIcon(event.category)}</Text>
                  <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {getCategoryDisplayName(event.category)}
                  </Text>
                </View>
                      <View style={{
                        alignSelf: 'flex-start',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: event.price > 0 ? tokens.priceBgWarning : tokens.priceBgSuccess
                      }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: event.price > 0 ? tokens.warning : tokens.success,
                          lineHeight: 18
                        }}>
                          {formatPrice(event.price, event.currency)}
                        </Text>
                      </View>
              </View>
            </View>

            {event.description && (
              <Text className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {event.description}
              </Text>
            )}
          </GlassCard>
        </Animated.View>

        {/* Event Details */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <GlassCard className="mb-6" style={{ paddingTop: 10 }}>
            <Text style={{ marginTop: 6 }} className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Event Details
            </Text>

            <View className="space-y-4">
              <View className="flex-row items-start mb-4">
                <Calendar size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                <View className="flex-1">
                  <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Date & Time
                  </Text>
                  <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatEventDate(event.event_date)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-4">
                <MapPin size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                <View className="flex-1">
                  <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Location
                  </Text>
                  <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                    {event.location}
                  </Text>
                </View>
              </View>

              {event.max_participants && (
                <View className="flex-row items-start mb-4">
                  <Users size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Capacity
                    </Text>
                    <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                      {event.current_participants || 0}/{event.max_participants} participants
                    </Text>
                  </View>
                </View>
              )}

              {event.contact_email && (
                <View className="flex-row items-start mb-4">
                  <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Contact Email
                    </Text>
                    <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                      {event.contact_email}
                    </Text>
                  </View>
                </View>
              )}

              {event.contact_phone && (
                <View className="flex-row items-start mb-4">
                  <Phone size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Contact Phone
                    </Text>
                    <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                      {event.contact_phone}
                    </Text>
                  </View>
                </View>
              )}

              {event.vaccination_required && (
                <View className="flex-row items-start mb-4">
                  <Info size={20} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3 mt-1" />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Requirements
                    </Text>
                    <Text style={{ lineHeight: 22 }} className={isDark ? 'text-white' : 'text-gray-900'}>
                      Vaccination required
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Additional Requirements */}
        {event.special_requirements && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <GlassCard className="mb-6" style={{ paddingBottom: 16 }}>
                <Text style={{ marginTop: 6 }} className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Special Requirements
                </Text>
                <Text style={{ marginBottom: 12, lineHeight: 22 }} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {event.special_requirements}
                </Text>
              </GlassCard>
          </Animated.View>
        )}

        {/* Registration Status */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <GlassCard className="mb-6">
            <View className="flex-row items-center">
              {event.is_registered ? (
                <CheckCircle size={24} color="#10B981" className="mr-3" />
              ) : (
                <Calendar size={24} color={isDark ? '#9CA3AF' : '#6B7280'} className="mr-3" />
              )}
              <View className="flex-1">
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {event.is_registered ? 'You are registered' : 'Registration Open'}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {event.is_registered 
                    ? 'Looking forward to seeing you!' 
                    : event.requires_approval 
                      ? 'Registration requires approval'
                      : 'Join this event now'
                  }
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Action Button */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          {event.is_registered ? (
            <GlassButton
              onPress={handleUnregister}
              disabled={registering}
              variant="outline"
              className="mb-4"
            >
                  {registering ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color={tokens.primaryContrast} size="small" className="mr-2" />
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Unregistering...
                  </Text>
                </View>
              ) : (
                'Unregister from Event'
              )}
            </GlassButton>
          ) : (
            <GlassButton
              onPress={handleRegister}
              disabled={registering || (event.max_participants && event.current_participants >= event.max_participants)}
              className="mb-4"
            >
              {registering ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color={tokens.primaryContrast} size="small" className="mr-2" />
                  <Text className="text-white font-bold">Registering...</Text>
                </View>
              ) : (event.max_participants && event.current_participants >= event.max_participants) ? (
                'Event Full'
              ) : (
                'Register for Event'
              )}
            </GlassButton>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default RegisterEventScreen;
