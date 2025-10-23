import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  X, 
  Star,
  ChevronLeft,
  Clock,
  Sparkles
} from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInDown
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchPendingSwipes, respondToSwipe } from '../store/slices/matchesSlice';
import { useTheme } from '../theme/ThemeContext';
import EmptyState from '../components/ui/EmptyState';
import { GlassCard } from '../components/glass';

const { width: screenWidth } = Dimensions.get('window');

const PendingSwipesScreen = ({ navigation }) => {
  const { accessToken } = useAuth();
  const dispatch = useAppDispatch();
  const { pendingSwipes, loading, error } = useAppSelector(state => state.matches);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { isDark } = useTheme();

  // Fetch pending swipes from API
  const loadPendingSwipes = useCallback(async () => {
    try {
      console.log('🔄 Loading pending swipes...');
      const result = await dispatch(fetchPendingSwipes());
      console.log('✅ Pending swipes result:', result);
    } catch (error) {
      console.error('❌ Error fetching pending swipes:', error);
    }
  }, [dispatch]);

  // Load pending swipes on mount and focus
  useFocusEffect(
    useCallback(() => {
      loadPendingSwipes();
    }, [loadPendingSwipes])
  );

  // Show error snackbar when error occurs
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPendingSwipes();
  }, [loadPendingSwipes]);

  // Handle swipe response
  const handleSwipeResponse = async (matchId, action) => {
    if (respondingTo) return; // Prevent multiple responses
    
    setRespondingTo(matchId);
    
    try {
      const response = await dispatch(respondToSwipe({ matchId, action }));
      
      // Check if the response was successful (payload.result contains the backend response)
      if (response.payload?.result?.message) {
        // Show success message
        if (response.payload.result.is_mutual_match) {
          Alert.alert(
            '🎉 It\'s a Match!',
            response.payload.result.message,
            [
              {
                text: 'Start Chatting',
                onPress: () => {
                  // Navigate to chat
                  navigation.navigate('ChatConversation', {
                    matchId: matchId,
                    otherUser: response.payload.result.match.other_user,
                    otherDog: response.payload.result.match.other_dog,
                    match: response.payload.result.match
                  });
                }
              },
              { text: 'OK' }
            ]
          );
        } else {
          Alert.alert('Success', response.payload.result.message);
        }
        
        // Refresh the pending swipes list
        await loadPendingSwipes();
      } else {
        Alert.alert('Error', response.error || response.payload?.message || 'Failed to respond to swipe');
      }
    } catch (error) {
      console.error('Error responding to swipe:', error);
      Alert.alert('Error', 'Failed to respond to swipe');
    } finally {
      setRespondingTo(null);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Render pending swipe card
  const renderPendingSwipe = ({ item: swipe, index }) => {
    const otherDog = swipe.other_dog;
    const otherOwner = otherDog.owner;
    const isResponding = respondingTo === swipe.id;
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(400)}
        className="mb-4 mx-4"
      >
        <GlassCard className="overflow-hidden">
          {/* Dog Image */}
          <View className="relative">
            <Image
              source={{ 
                uri: otherDog.primary_photo_url && otherDog.primary_photo_url !== '/static/images/default-dog.jpg'
                  ? otherDog.primary_photo_url
                  : (otherDog.photos && otherDog.photos.length > 0
                      ? otherDog.photos[0].url
                      : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face')
              }}
              className="w-full h-80"
              resizeMode="cover"
            />
            
            {/* Swipe Action Badge */}
            <View className={`absolute top-4 right-4 flex-row items-center px-3 py-2 rounded-full ${
              swipe.other_dog_action === 'super_like' ? 'bg-blue-500' : 'bg-pink-500'
            }`}>
              {swipe.other_dog_action === 'super_like' ? (
                <Star size={16} className="text-white" fill="white" />
              ) : (
                <Heart size={16} className="text-white" fill="white" />
              )}
              <Text className="text-white text-xs font-bold ml-1">
                {swipe.other_dog_action === 'like' ? 'Liked You' : 'Super Liked You'}
              </Text>
            </View>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              className="absolute bottom-0 left-0 right-0 h-32"
            />
          </View>

          {/* Dog Info */}
          <View className="p-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`text-2xl font-bold flex-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {otherDog.name}
              </Text>
              <View className="px-3 py-1 rounded-full bg-primary-500/20">
                <Text className="text-primary-500 text-sm font-semibold">
                  {otherDog.age_string || `${otherDog.age_years || 0} years`}
                </Text>
              </View>
            </View>

            <Text className={`text-base mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {otherDog.breed}
            </Text>

            {otherDog.description && (
              <Text 
                className={`text-sm mb-4 leading-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
                numberOfLines={2}
              >
                {otherDog.description}
              </Text>
            )}

            {/* Owner Info */}
            <View className="flex-row items-center mb-4 pb-4 border-b" style={{
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            }}>
              <Image
                source={{
                  uri: otherOwner?.profile_photo_url || 
                       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {otherOwner?.first_name} {otherOwner?.last_name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Clock size={12} className={isDark ? 'text-gray-500' : 'text-gray-500'} />
                  <Text className={`text-xs ml-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(swipe.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              {/* Pass Button */}
              <TouchableOpacity
                onPress={() => handleSwipeResponse(swipe.id, 'pass')}
                disabled={isResponding}
                className={`flex-1 py-3 rounded-2xl border-2 items-center ${
                  isResponding ? 'opacity-50' : ''
                } ${
                  isDark ? 'border-gray-600 bg-white/5' : 'border-gray-300 bg-gray-50'
                }`}
                activeOpacity={0.7}
              >
                <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <Text className={`text-xs font-semibold mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pass
                </Text>
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity
                onPress={() => handleSwipeResponse(swipe.id, 'like')}
                disabled={isResponding}
                className={`flex-1 py-3 rounded-2xl items-center bg-pink-500 ${
                  isResponding ? 'opacity-50' : ''
                }`}
                activeOpacity={0.7}
              >
                <Heart size={24} className="text-white" fill="white" />
                <Text className="text-white text-xs font-semibold mt-1">
                  Like
                </Text>
              </TouchableOpacity>

              {/* Super Like Button */}
              <TouchableOpacity
                onPress={() => handleSwipeResponse(swipe.id, 'super_like')}
                disabled={isResponding}
                className={`flex-1 py-3 rounded-2xl items-center bg-blue-500 ${
                  isResponding ? 'opacity-50' : ''
                }`}
                activeOpacity={0.7}
              >
                <Star size={24} className="text-white" fill="white" />
                <Text className="text-white text-xs font-semibold mt-1">
                  Super
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    );
  };


  if (loading) {
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
            className="px-6 py-6 flex-row items-center"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? 'bg-white/10' : 'bg-white/70'
              }`}>
                <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
              </View>
            </TouchableOpacity>
            
            <View>
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Pending Swipes
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Loading...
              </Text>
            </View>
          </Animated.View>

          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading pending swipes...
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
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mr-4"
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? 'bg-white/10' : 'bg-white/70'
                }`}>
                  <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
                </View>
              </TouchableOpacity>
              
              <View>
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Pending Swipes
                </Text>
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {pendingSwipes.length} {pendingSwipes.length === 1 ? 'swipe' : 'swipes'}
                </Text>
              </View>
            </View>

            {/* Sparkles Icon */}
            {pendingSwipes.length > 0 && (
              <View className="w-12 h-12 rounded-full bg-yellow-500/20 items-center justify-center">
                <Sparkles size={24} className="text-yellow-500" />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Content */}
        {pendingSwipes.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No pending swipes!"
            description="All caught up! Check back later for new swipes."
            actionLabel="Go to Discover"
            onAction={() => navigation.navigate('Discover')}
          />
        ) : (
          <FlatList
            data={pendingSwipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPendingSwipe}
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


export default PendingSwipesScreen;
