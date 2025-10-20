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
                className="w-full h-48"
                resizeMode="cover"
              />
            )}

            <View className="p-4">
              {/* Event Header */}
              <View className="flex-row items-start mb-3">
                {/* Category Icon */}
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                  style={{ backgroundColor: categoryColor + '20' }}
                >
                  <CategoryIcon size={24} color={categoryColor} />
                </View>
                
                {/* Event Info */}
                <View className="flex-1">
                  <Text className={`text-lg font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {event.title}
                  </Text>
                  
                  <View 
                    className="self-start px-2.5 py-1 rounded-full mb-1"
                    style={{ backgroundColor: categoryColor + '15' }}
                  >
                    <Text 
                      className="text-xs font-semibold"
                      style={{ color: categoryColor }}
                    >
                      {getCategoryDisplayName(event.category)}
                    </Text>
                  </View>
                  
                  <Text className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    by {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
                  </Text>
                </View>
                
                {/* Price Badge */}
                <View 
                  className={`px-3 py-1.5 rounded-full ${
                    event.price > 0 
                      ? 'bg-yellow-100' 
                      : 'bg-green-100'
                  }`}
                >
                  <Text className={`text-xs font-bold ${
                    event.price > 0 
                      ? 'text-yellow-700' 
                      : 'text-green-700'
                  }`}>
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
                  <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2.5 ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  </View>
                  <Text className={`text-sm flex-1 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {formatEventDate(event.event_date)}
                  </Text>
                </View>
                
                {/* Location */}
                <View className="flex-row items-center mt-2">
                  <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2.5 ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <MapPin size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  </View>
                  <Text 
                    className={`text-sm flex-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    numberOfLines={1}
                  >
                    {event.location}
                  </Text>
                </View>
                
                {/* Participants */}
                {event.max_participants && (
                  <View className="flex-row items-center mt-2">
                    <View className={`w-8 h-8 rounded-lg items-center justify-center mr-2.5 ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      <Users size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </View>
                    <Text className={`text-sm flex-1 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {event.current_participants}/{event.max_participants} participants
                    </Text>
                    {event.is_full && (
                      <View className="px-2 py-1 rounded-full bg-red-500">
                        <Text className="text-white text-xs font-bold">FULL</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Event Actions */}
              <View className="flex-row items-center justify-between pt-3 border-t" style={{
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}>
                {/* Status Badge */}
                <View className="flex-row items-center">
                  {event.is_registered ? (
                    <View className="flex-row items-center px-3 py-1.5 rounded-full bg-primary-500/20">
                      <CheckCircle size={14} className="text-primary-500" />
                      <Text className="text-primary-500 text-xs font-semibold ml-1.5">Registered</Text>
                    </View>
                  ) : event.is_registration_open ? (
                    <View className="flex-row items-center px-3 py-1.5 rounded-full bg-green-500/20">
                      <CalendarPlus size={14} className="text-green-600" />
                      <Text className="text-green-600 text-xs font-semibold ml-1.5">Open</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center px-3 py-1.5 rounded-full bg-red-500/20">
                      <XCircle size={14} className="text-red-500" />
                      <Text className="text-red-500 text-xs font-semibold ml-1.5">Closed</Text>
                    </View>
                  )}
                </View>
                
                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('RegisterEvent', { eventId: event.id })}
                  className="flex-row items-center px-4 py-2 rounded-full bg-primary-500"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-sm font-semibold mr-1">Details</Text>
                  <ArrowRight size={16} className="text-white" />
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
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="px-6 py-6"
          >
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Events
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Join community events
            </Text>
          </Animated.View>

          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading events...
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
                Events
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Join community events and meetups
              </Text>
            </View>

            {userCanCreateEvents && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEvent')}
                className="px-4 py-2.5 rounded-full bg-primary-500 flex-row items-center"
                activeOpacity={0.8}
              >
                <Plus size={18} className="text-white" />
                <Text className="text-white text-sm font-semibold ml-1.5">Create</Text>
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
              colors={['#6366F1']}
              tintColor="#6366F1"
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
              <Text className={`text-sm font-semibold mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
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
