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
import { logger } from '../utils/logger';
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
      logger.log('🔄 Loading pending swipes...');
      const result = await dispatch(fetchPendingSwipes()).unwrap();
      logger.log('✅ Pending swipes result:', result);
    } catch (error) {
      logger.error('❌ Error fetching pending swipes:', error);
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
      logger.error('Error responding to swipe:', error);
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
            <View
              className="absolute top-4 right-4 flex-row items-center px-3 py-2 rounded-full"
              style={{ backgroundColor: swipe.other_dog_action === 'super_like' ? tokens.actionSuperLikeBg : tokens.overlayPassBg }}
            >
              {swipe.other_dog_action === 'super_like' ? (
                <Star size={16} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
              ) : (
                <Heart size={16} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
              )}
              <Text style={{ color: tokens.primaryContrast, fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
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
              <Text style={{ color: tokens.textPrimary, fontSize: 20, fontWeight: '700', flex: 1 }}>
                {otherDog.name}
              </Text>
              <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: 'rgba(99,102,241,0.12)' }}>
                <Text style={{ color: tokens.primary, fontSize: 12, fontWeight: '600' }}>
                  {otherDog.age_string || `${otherDog.age_years || 0} years`}
                </Text>
              </View>
            </View>

            <Text style={{ color: tokens.textSecondary, fontSize: 16, marginBottom: 8 }}>
              {otherDog.breed}
            </Text>

            {otherDog.description && (
              <Text 
                style={{ color: tokens.textSecondary, fontSize: 14, marginBottom: 12, lineHeight: 20 }}
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
                <Text style={{ color: tokens.textPrimary, fontSize: 14, fontWeight: '600' }}>
                  {otherOwner?.first_name} {otherOwner?.last_name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Clock size={12} color={tokens.textSecondary} />
                  <Text style={{ color: tokens.textSecondary, marginLeft: 6, fontSize: 12 }}>
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
                className={`flex-1 py-3 rounded-2xl border-2 items-center ${isResponding ? 'opacity-50' : ''}`}
                activeOpacity={0.7}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : tokens.cardBackground, borderColor: tokens.border }}
              >
                <X size={24} color={tokens.textSecondary} />
                <Text style={{ color: tokens.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>Pass</Text>
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity
                onPress={() => handleSwipeResponse(swipe.id, 'like')}
                disabled={isResponding}
                className={`flex-1 py-3 rounded-2xl items-center ${isResponding ? 'opacity-50' : ''}`}
                activeOpacity={0.7}
                style={{ backgroundColor: tokens.overlayPassBg }}
              >
                <Heart size={24} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
                <Text style={{ color: tokens.primaryContrast, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                  Like
                </Text>
              </TouchableOpacity>

              {/* Super Like Button */}
              <TouchableOpacity
                onPress={() => handleSwipeResponse(swipe.id, 'super_like')}
                disabled={isResponding}
                className={`flex-1 py-3 rounded-2xl items-center ${isResponding ? 'opacity-50' : ''}`}
                activeOpacity={0.7}
                style={{ backgroundColor: tokens.actionSuperLikeBg }}
              >
                <Star size={24} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
                <Text style={{ color: tokens.primaryContrast, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
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
