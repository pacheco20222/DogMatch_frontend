import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  View, 
  Text,
  Image, 
  Alert, 
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Swiper } from 'rn-swiper-list';
import { X, Heart, Star, Users, Zap, Ruler, RotateCcw } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchDiscoverDogs, clearError } from '../store/slices/dogsSlice';
import { swipeDog, fetchPendingSwipes, clearError as clearMatchesError } from '../store/slices/matchesSlice';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import { GlassCard, GradientText } from '../components/glass';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.65;

const DiscoverScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { discoverDogs, discoverLoading, error: dogsError } = useAppSelector(state => state.dogs);
  const { pendingSwipes, pendingLoading, error: matchesError } = useAppSelector(state => state.matches);
  const [swiping, setSwiping] = useState(false);
  const swiperRef = useRef();
  const insets = useSafeAreaInsets();

  // Load dogs for swiping
  const loadDogs = useCallback(async () => {
    try {
      await dispatch(fetchDiscoverDogs()).unwrap();
    } catch (e) {
      logger.error('Failed to load discover dogs:', e);
    }
  }, [dispatch]);

  // Load pending swipes
  const loadPendingSwipes = useCallback(async () => {
    try {
      await dispatch(fetchPendingSwipes()).unwrap();
    } catch (e) {
      // Silently fail for pending swipes
    }
  }, [dispatch]);

  useEffect(() => {
    loadDogs();
    loadPendingSwipes();
  }, [loadDogs, loadPendingSwipes]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMatchesError());
    };
  }, [dispatch]);

  // Handle swipe action - PRESERVE THIS EXACTLY
  const handleSwipe = useCallback(async (action, cardIndex) => {
    if (cardIndex >= discoverDogs.length || swiping) return;
    
    const currentDog = discoverDogs[cardIndex];
    setSwiping(true);

    try {
      const response = await dispatch(swipeDog({ 
        dogId: currentDog.id, 
        action: action 
      })).unwrap();

      // Show match notification if it's a mutual match
      if (response.is_mutual_match) {
        Alert.alert(
          "It's a Match! 🎉",
          response.message,
          [
            { text: 'Keep Swiping', style: 'default' },
            { text: 'View Matches', style: 'default', onPress: () => navigation.navigate('Matches') }
          ]
        );
      }
      
    } catch (error) {
      logger.error('Error swiping:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already swiped')) {
        logger.log('Already swiped on this dog, continuing...');
      } else if (error.status === 400) {
        logger.log('Swipe request failed (likely already swiped), continuing...');
      } else {
        Alert.alert('Error', 'Failed to process swipe. Please try again.');
      }
    } finally {
      setSwiping(false);
    }
  }, [discoverDogs, dispatch, navigation, swiping]);

  // Render individual dog card with glass morphism design
  const renderCard = useCallback((dog) => {
    // Debug: Log dog data to see photo structure
    logger.log('Rendering dog card:', {
      name: dog.name,
      photos: dog.photos,
      primary_photo_url: dog.primary_photo_url
    });

    // Determine image URL - prioritize primary_photo_url, then photos array
    // S3 photos will already have full HTTPS URLs, local photos need backend URL prefix
    let imageUrl = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face';
    
    if (dog.primary_photo_url && dog.primary_photo_url !== '/static/images/default-dog.jpg') {
      // Use primary photo URL (should be S3 signed URL or local path)
      imageUrl = dog.primary_photo_url;
      logger.log('Using primary_photo_url:', imageUrl);
    } else if (dog.photos && dog.photos.length > 0) {
      // Fallback to first photo in photos array (should be S3 signed URL)
      imageUrl = dog.photos[0].url;
      logger.log('Using photos[0].url:', imageUrl);
    }

    return (
      <View style={styles.cardContainer}>
        {/* Dog Photo */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            logger.log('❌ Image load error for', dog.name, ':', e.nativeEvent.error);
            logger.log('Failed URL:', imageUrl);
          }}
          onLoad={() => logger.log('✅ Image loaded successfully for:', dog.name)}
        />
        
        {/* Gradient overlay for better text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        />

        {/* Dog Info - Glass Card at bottom */}
        <View style={styles.dogInfoContainer}>
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-3xl font-bold flex-1">
                {dog.name}
              </Text>
              <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-accent-500/30' : 'bg-accent-400/30'}`}>
                <Text className="text-white text-sm font-semibold">
                  {dog.age_string || `${dog.age_years || 0} years`}
                </Text>
              </View>
            </View>
            
            <Text className="text-white text-lg mb-2 opacity-90">
              {dog.breed}
            </Text>

            {/* Owner Information */}
            {dog.owner && (
              <View className="flex-row items-center mb-2">
                <Users size={16} className="text-white opacity-80 mr-2" />
                <Text className="text-white text-sm opacity-80">
                  {dog.owner.first_name} {dog.owner.last_name}
                </Text>
              </View>
            )}
            
            <Text className="text-white text-sm opacity-80 leading-5" numberOfLines={2}>
              {dog.description}
            </Text>
          </View>
          
          {/* Traits */}
          <View className="flex-row space-x-2">
            <View className={`px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? 'bg-white/20' : 'bg-white/30'}`}>
              <Ruler size={14} className="text-white mr-1" />
              <Text className="text-white text-xs font-medium">
                {dog.size}
              </Text>
            </View>
            <View className={`px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? 'bg-white/20' : 'bg-white/30'}`}>
              <Zap size={14} className="text-white mr-1" />
              <Text className="text-white text-xs font-medium">
                {dog.energy_level || 'Medium'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [isDark]);

  // Overlay components for swipe feedback - PRESERVE THESE
  const OverlayLabelRight = useCallback(() => (
    <View style={styles.overlayLabelLike}>
      <Heart size={56} color="#fff" fill="#fff" />
      <Text className="text-white text-xl font-bold mt-2">LIKE</Text>
    </View>
  ), []);

  const OverlayLabelLeft = useCallback(() => (
    <View style={styles.overlayLabelPass}>
      <X size={56} color="#fff" strokeWidth={3} />
      <Text className="text-white text-xl font-bold mt-2">PASS</Text>
    </View>
  ), []);

  const OverlayLabelTop = useCallback(() => (
    <View style={styles.overlayLabelSuperLike}>
      <Star size={56} color="#fff" fill="#fff" />
      <Text className="text-white text-base font-bold mt-2">SUPER LIKE</Text>
    </View>
  ), []);

  // Loading State
  if (discoverLoading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
          colors={isDark 
            ? ['#312E81', '#1E293B', '#0F172A'] 
            : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
          }
          className="absolute top-0 left-0 right-0 bottom-0"
        />
        <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className={`text-base mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Finding perfect matches for you...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  // Empty State
  if (discoverDogs.length === 0) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
          colors={isDark 
            ? ['#312E81', '#1E293B', '#0F172A'] 
            : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
          }
          className="absolute top-0 left-0 right-0 bottom-0"
        />
        <SafeAreaView className="flex-1 items-center justify-center px-6" edges={['top']}>
          <Animated.View entering={FadeIn.duration(600)} className="items-center">
            <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
              isDark ? 'bg-primary-500/20' : 'bg-primary-100'
            }`}>
              <Heart size={48} className="text-primary-500" />
            </View>
            <Text className={`text-2xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No more dogs to discover!
            </Text>
            <Text className={`text-base text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Check back later for new profiles or adjust your preferences.
            </Text>
            <TouchableOpacity
              onPress={loadDogs}
              activeOpacity={0.8}
              className="px-6 py-3 rounded-xl bg-primary-500"
            >
              <Text className="text-white font-semibold">Refresh</Text>
            </TouchableOpacity>
          </Animated.View>
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
        className="absolute top-0 left-0 right-0 h-80"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <GradientText
                colors={['#6366F1', '#EC4899', '#14B8A6']}
                className="text-3xl font-bold mb-1"
              >
                Discover
              </GradientText>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Find your perfect match
              </Text>
            </View>
            
            <View className="flex-row space-x-2">
              {pendingSwipes.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('PendingSwipes')}
                  activeOpacity={0.7}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    isDark ? 'bg-secondary-500/20' : 'bg-secondary-100'
                  }`}
                >
                  <Heart size={20} className="text-secondary-500" />
                  <View className="absolute top-0 right-0 w-5 h-5 rounded-full bg-secondary-500 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{pendingSwipes.length}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => navigation.navigate('Matches')}
                activeOpacity={0.7}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  isDark ? 'bg-primary-500/20' : 'bg-primary-100'
                }`}
              >
                <Heart size={20} className="text-primary-500" fill="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Swiper Container - PRESERVE ALL SWIPER FUNCTIONALITY */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingBottom: 20,
          }}
        >
          <Swiper
            ref={swiperRef}
            data={discoverDogs}
            renderCard={renderCard}
            prerenderItems={2}
            cardStyle={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              alignSelf: 'center',
              borderRadius: 24,
            }}
            overlayLabelContainerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onSwipeLeft={(cardIndex) => handleSwipe('pass', cardIndex)}
            onSwipeRight={(cardIndex) => handleSwipe('like', cardIndex)}
            onSwipeTop={(cardIndex) => handleSwipe('super_like', cardIndex)}
            onSwipedAll={() => {
              Alert.alert('No More Dogs!', "You've seen all available dogs. Check back later for new matches!");
            }}
            OverlayLabelLeft={OverlayLabelLeft}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelTop={OverlayLabelTop}
            translateXRange={[-screenWidth / 3, 0, screenWidth / 3]}
            translateYRange={[-screenHeight / 3, 0, screenHeight / 3]}
            rotateInputRange={[-screenWidth / 3, 0, screenWidth / 3]}
            rotateOutputRange={[-Math.PI / 20, 0, Math.PI / 20]}
            inputOverlayLabelRightOpacityRange={[0, screenWidth / 3]}
            outputOverlayLabelRightOpacityRange={[0, 1]}
            inputOverlayLabelLeftOpacityRange={[0, -(screenWidth / 3)]}
            outputOverlayLabelLeftOpacityRange={[0, 1]}
            inputOverlayLabelTopOpacityRange={[0, -(screenHeight / 3)]}
            outputOverlayLabelTopOpacityRange={[0, 1]}
          />
        </Animated.View>

        {/* Action Buttons - Modern Glass Design */}
        <Animated.View 
          entering={SlideInUp.delay(400).duration(600)}
          className="flex-row justify-center items-center px-6 space-x-4"
          style={{ paddingBottom: insets.bottom + 80, marginTop: 20 }}
        >
          {/* Pass Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeLeft()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              borderColor: 'rgba(239, 68, 68, 0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <X size={28} color="#EF4444" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Super Like Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeTop()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(236, 72, 153, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#EC4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Star size={24} color="#fff" fill="#fff" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeRight()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(99, 102, 241, 0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Heart size={28} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  dogInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  overlayLabelLike: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlayLabelPass: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlayLabelSuperLike: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(236, 72, 153, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default DiscoverScreen;
