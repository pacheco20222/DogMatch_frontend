import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  CalendarPlus,
  Dog,
  GraduationCap,
  Home,
  Trophy,
  PartyPopper,
  BookOpen
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchEvents, clearError } from '../store/slices/eventsSlice';
import { useAuth } from '../hooks/useAuth';
import { canCreateEvents } from '../utils/permissions';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';
import EmptyState from '../components/ui/EmptyState';
import { GlassCard, GlassButton, FloatingActionButton } from '../components/glass';

const EventsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { events, loading, error } = useAppSelector(state => state.events);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Check if user can create events (admin or shelter only)
  const userCanCreateEvents = canCreateEvents(user);

  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const int = parseInt(full, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
      'meetup': Dog,
      'training': GraduationCap,
      'adoption': Home,
      'competition': Trophy,
      'social': PartyPopper,
      'educational': BookOpen
    };
    return iconMap[category] || Calendar;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'meetup': '#6366F1',
      'training': '#8B5CF6',
      'adoption': '#10B981',
      'competition': '#F59E0B',
      'social': '#EC4899',
      'educational': '#3B82F6'
    };
    return colorMap[category] || '#6366F1';
  };

  const renderEventCard = (event, index) => {
    const CategoryIcon = getCategoryIcon(event.category);
    const categoryColor = getCategoryColor(event.category);
    
    return (
      <Animated.View
        key={event.id}
        entering={FadeInDown.delay(index * 100).duration(400)}
        className="mb-4"
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
          activeOpacity={0.9}
        >
          <GlassCard className="overflow-hidden">
            {/* Event Photo */}
            {event.photo_url && (
              <Image
                source={{ 
                  uri: event.photo_url.startsWith('http') 
                    ? event.photo_url 
                    : `https://dogmatch-backend.onrender.com${event.photo_url}`
                }} 
                style={{ width: '100%', height: 192 }}
                resizeMode="cover"
              />
            )}

            <View className="p-4">
              {/* Event Header */}
              <View className="flex-row items-start mb-3">
                {/* Category Icon */}
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: hexToRgba(categoryColor, 0.125) }}
                >
                  <CategoryIcon size={24} color={categoryColor} />
                </View>
                
                {/* Event Info */}
                <View className="flex-1">
                  <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                    {event.title}
                  </Text>
                  
                  <View 
                    className="self-start px-2.5 py-1 rounded-full mb-1"
                    style={{ backgroundColor: hexToRgba(categoryColor, 0.08) }}
                  >
                    <Text 
                      style={{ color: categoryColor, fontSize: 12, fontWeight: '600' }}
                    >
                      {getCategoryDisplayName(event.category)}
                    </Text>
                  </View>
                  
                  <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
                    by {event.organizer?.user_type === 'admin' 
                      ? 'DogMatch' 
                      : (event.organizer?.full_name || event.organizer?.username || 'Unknown')}
                  </Text>
                </View>
                
                {/* Price Badge */}
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: event.price > 0 
                      ? (isDark ? hexToRgba(tokens.warning, 0.12) : tokens.priceBgWarning) 
                      : (isDark ? hexToRgba(tokens.success, 0.12) : tokens.priceBgSuccess)
                  }}
                >
                  <Text style={{ color: event.price > 0 ? tokens.warning : tokens.success, fontSize: 12, fontWeight: '700' }}>
                    {formatPrice(event.price, event.currency)}
                  </Text>
                </View>
              </View>

              {/* Event Description */}
              {event.description && (
                <Text 
                  className={`text-sm mb-3 leading-5 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  numberOfLines={2}
                >
                  {event.description}
                </Text>
              )}

              {/* Event Details */}
              <View className="mb-3 space-y-2">
                {/* Date */}
                <View className="flex-row items-center">
                  <View style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                    <Calendar size={16} color={tokens.textSecondary} />
                  </View>
                  <Text style={{ color: tokens.textSecondary, fontSize: 14, flex: 1 }}>
                    {formatEventDate(event.event_date)}
                  </Text>
                </View>
                
                {/* Location */}
                <View className="flex-row items-center mt-2">
                  <View style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                    <MapPin size={16} color={tokens.textSecondary} />
                  </View>
                  <Text 
                    style={{ color: tokens.textSecondary, fontSize: 14, flex: 1 }}
                    numberOfLines={1}
                  >
                    {event.location}
                  </Text>
                </View>
                
                {/* Participants */}
                {event.max_participants && (
                  <View className="flex-row items-center mt-2">
                    <View style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                      <Users size={16} color={tokens.textSecondary} />
                    </View>
                    <Text style={{ color: tokens.textSecondary, fontSize: 14, flex: 1 }}>
                      {event.current_participants}/{event.max_participants} participants
                    </Text>
                    {event.is_full && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: tokens.danger }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>FULL</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Event Actions */}
              <View className="flex-row items-center justify-between pt-3 border-t" style={{
                borderTopColor: isDark ? tokens.headerBorder : tokens.border
              }}>
                {/* Status Badge */}
                <View className="flex-row items-center">
                  {event.is_registered ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: hexToRgba(tokens.primary, 0.125) }}>
                      <CheckCircle size={14} color={tokens.primary} />
                      <Text style={{ color: tokens.primary, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Registered</Text>
                    </View>
                  ) : event.is_registration_open ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: hexToRgba(tokens.success, 0.125) }}>
                      <CalendarPlus size={14} color={tokens.success} />
                      <Text style={{ color: tokens.success, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Open</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: hexToRgba(tokens.danger, 0.125) }}>
                      <XCircle size={14} color={tokens.danger} />
                      <Text style={{ color: tokens.danger, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>Closed</Text>
                    </View>
                  )}
                </View>
                
                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
                  className="flex-row items-center px-4 py-2 rounded-full"
                  activeOpacity={0.8}
                  style={{ backgroundColor: tokens.primary }}
                >
                  <Text style={{ color: tokens.primaryContrast, fontSize: 14, fontWeight: '600', marginRight: 6 }}>Details</Text>
                  <ArrowRight size={16} color={tokens.primaryContrast} />
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={tokens.gradientBackground}
          className="absolute top-0 left-0 right-0 h-64"
        />

        <SafeAreaView className="flex-1" edges={['top']}>
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="px-6 py-6"
          >
            <Text style={{ color: tokens.textPrimary, fontSize: 34, fontWeight: '700' }}>
              Events
            </Text>
            <Text style={{ color: tokens.textSecondary, fontSize: 16, marginTop: 4 }}>
              Join community events
            </Text>
          </Animated.View>

          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={tokens.primary} />
            <Text style={{ marginTop: 12, fontSize: 16, color: tokens.textSecondary }}>
              Loading events...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={tokens.gradientBackground}
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
              <Text style={{ color: tokens.textPrimary, fontSize: 34, fontWeight: '700' }}>
                Events
              </Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 16, marginTop: 4 }}>
                Join community events and meetups
              </Text>
            </View>

            {userCanCreateEvents && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEvent')}
                className="px-4 py-2.5 rounded-full flex-row items-center"
                activeOpacity={0.8}
                style={{ backgroundColor: tokens.primary }}
              >
                <Plus size={18} color={tokens.primaryContrast} />
                <Text style={{ color: tokens.primaryContrast, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>Create</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadEvents(true)}
              colors={[tokens.primary]}
              tintColor={tokens.primary}
            />
          }
        >
          {error ? (
            <EmptyState
              icon="alert-circle"
              title="Oops! Something went wrong"
              description={error}
              actionLabel="Try Again"
              onAction={() => loadEvents()}
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No events available"
              description={userCanCreateEvents 
                ? 'Create your first event to get started!'
                : 'Check back soon for upcoming events in your area.'
              }
              actionLabel={userCanCreateEvents ? "Create Event" : undefined}
              onAction={userCanCreateEvents ? () => navigation.navigate('CreateEvent') : undefined}
            />
          ) : (
            <Animated.View entering={SlideInRight.duration(400)}>
              <Text style={{ color: tokens.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                {events.length} event{events.length !== 1 ? 's' : ''} available
              </Text>
              {events.map((event, index) => renderEventCard(event, index))}
            </Animated.View>
          )}
        </ScrollView>

        {/* FAB for quick create */}
        {userCanCreateEvents && (
          <FloatingActionButton
            icon={Plus}
            onPress={() => navigation.navigate('CreateEvent')}
          />
        )}
      </SafeAreaView>
    </View>
  );
};


export default EventsScreen;
