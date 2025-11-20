import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  View, 
  Text,
  Alert, 
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
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
import { getDesignTokens } from '../styles/designTokens';
import { logger } from '../utils/logger';
import { GlassCard, GradientText } from '../components/glass';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.65;

const DiscoverScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const styles = useMemo(() => createStyles(tokens), [isDark]);
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
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={200}
          cachePolicy="memory-disk"
          onError={(e) => {
            logger.log('❌ Image load error for', dog.name, ':', e.nativeEvent?.error || e);
            logger.log('Failed URL:', imageUrl);
          }}
          onLoad={() => logger.log('✅ Image loaded successfully for:', dog.name)}
        />
        
        {/* Gradient overlay for better text readability */}
        <LinearGradient
          colors={[ 'transparent', 'rgba(0,0,0,0.8)' ]}
          style={styles.gradientOverlay}
        />

        {/* Dog Info - Glass Card at bottom */}
        <View style={styles.dogInfoContainer}>
          <View className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
              <Text
                className="text-3xl font-bold flex-1"
                style={{ color: tokens.textPrimary }}
              >
                {dog.name}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isDark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.08)'
                }}
              >
                <Text style={{ color: tokens.primaryContrast, fontWeight: '600', fontSize: 14 }}>
                  {dog.age_string || `${dog.age_years || 0} years`}
                </Text>
              </View>
            </View>
            
            <Text style={{ color: tokens.textPrimary, fontSize: 18, marginBottom: 8, opacity: 0.9 }}>
              {dog.breed}
            </Text>

            {/* Owner Information */}
            {dog.owner && (
              <View className="flex-row items-center mb-2">
                <Users size={16} color={tokens.textPrimary} style={{ opacity: 0.8, marginRight: 8 }} />
                <Text style={{ color: tokens.textPrimary, fontSize: 14, opacity: 0.8 }}>
                  {dog.owner.first_name} {dog.owner.last_name}
                </Text>
              </View>
            )}
            
            <Text style={{ color: tokens.textPrimary, fontSize: 14, opacity: 0.8, lineHeight: 20 }} numberOfLines={2}>
              {dog.description}
            </Text>
          </View>
          
          {/* Traits */}
          <View className="flex-row space-x-2">
            <View
              className="px-3 py-1.5 rounded-lg flex-row items-center"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)' }}
            >
              <Ruler size={14} color={tokens.textPrimary} style={{ marginRight: 6 }} />
              <Text style={{ color: tokens.textPrimary, fontSize: 12, fontWeight: '500' }}>
                {dog.size}
              </Text>
            </View>
            <View
              className="px-3 py-1.5 rounded-lg flex-row items-center"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)' }}
            >
              <Zap size={14} color={tokens.textPrimary} style={{ marginRight: 6 }} />
              <Text style={{ color: tokens.textPrimary, fontSize: 12, fontWeight: '500' }}>
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
      <Heart size={56} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
      <Text style={{ color: tokens.primaryContrast, fontSize: 18, fontWeight: '700', marginTop: 8 }}>LIKE</Text>
    </View>
  ), []);

  const OverlayLabelLeft = useCallback(() => (
    <View style={styles.overlayLabelPass}>
      <X size={56} color={tokens.primaryContrast} strokeWidth={3} />
      <Text style={{ color: tokens.primaryContrast, fontSize: 18, fontWeight: '700', marginTop: 8 }}>PASS</Text>
    </View>
  ), []);

  const OverlayLabelTop = useCallback(() => (
    <View style={styles.overlayLabelSuperLike}>
      <Star size={56} color={tokens.primaryContrast} fill={tokens.primaryContrast} />
      <Text style={{ color: tokens.primaryContrast, fontSize: 16, fontWeight: '700', marginTop: 8 }}>SUPER LIKE</Text>
    </View>
  ), []);

  // Loading State
  if (discoverLoading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
            colors={tokens.gradientBackground}
            className="absolute top-0 left-0 right-0 bottom-0"
          />
        <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
          <ActivityIndicator size="large" color={tokens.primary} />
            <Text style={{ color: tokens.textSecondary, marginTop: 16, fontSize: 16 }}>
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
          colors={tokens.gradientBackground}
          className="absolute top-0 left-0 right-0 bottom-0"
        />
        <SafeAreaView className="flex-1 items-center justify-center px-6" edges={['top']}>
          <Animated.View entering={FadeIn.duration(600)} className="items-center">
              <View className={`w-24 h-24 rounded-full items-center justify-center mb-6`} style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}>
              <Heart size={48} color={tokens.primary} />
            </View>
            <Text style={{ color: tokens.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
              No more dogs to discover!
            </Text>
            <Text style={{ color: tokens.textSecondary, fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
              Check back later for new profiles or adjust your preferences.
            </Text>
            <TouchableOpacity
              onPress={loadDogs}
              activeOpacity={0.8}
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: tokens.primary }}
            >
              <Text style={{ color: tokens.primaryContrast, fontWeight: '600' }}>Refresh</Text>
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
        colors={tokens.gradientBackground}
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
              <Text style={{ color: tokens.textSecondary, fontSize: 14 }}>
                Find your perfect match
              </Text>
            </View>
            
            <View className="flex-row space-x-2">
                {pendingSwipes.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('PendingSwipes')}
                  activeOpacity={0.7}
                  className={`w-12 h-12 rounded-full items-center justify-center`}
                  style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}
                >
                  <Heart size={20} color={tokens.primary} />
                  <View className="absolute top-0 right-0 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: tokens.primary }}>
                    <Text style={{ color: tokens.primaryContrast, fontSize: 10, fontWeight: '700' }}>{pendingSwipes.length}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => navigation.navigate('Matches')}
                activeOpacity={0.7}
                className={`w-12 h-12 rounded-full items-center justify-center`}
                style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}
              >
                <Heart size={20} color={tokens.primary} fill={tokens.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Swiper Container - PRESERVE ALL SWIPER FUNCTIONALITY */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.swiperContainer}
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
          style={{ paddingBottom: insets.bottom + 80, marginTop: 30 }}
        >
          {/* Pass Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeLeft()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDark ? tokens.actionPassBg : tokens.actionPassBg,
              borderWidth: 2,
              borderColor: isDark ? tokens.actionPassBorder : tokens.actionPassBorder,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: tokens.actionLikeShadow || '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            <X size={24} color="#EF4444" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Super Like Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeTop()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: tokens.actionSuperLikeBg,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: tokens.actionSuperLikeBg || '#EC4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Star size={20} color="#fff" fill="#fff" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            onPress={() => swiperRef.current?.swipeRight()}
            disabled={swiping}
            activeOpacity={0.8}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: tokens.actionLikeBg,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: tokens.actionLikeShadow || '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Heart size={24} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

function createStyles(tokens) {
  return StyleSheet.create({
    cardContainer: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: tokens.borderRadius,
      overflow: 'hidden',
      backgroundColor: tokens.cardBackground,
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
      padding: tokens.spacingLarge,
    },
    overlayLabelLike: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: tokens.primaryVariant,
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
      backgroundColor: tokens.danger,
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
      backgroundColor: tokens.overlaySuperLikeBg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    swiperContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 20,
    },
  });
}

export default DiscoverScreen;
