import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swiper } from 'rn-swiper-list';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  interpolate,
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;
const CARD_HEIGHT = screenHeight * 0.65;

const DiscoverScreen = ({ navigation }) => {
  const { user, accessToken } = useContext(AuthContext);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const swiperRef = useRef();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);

  // Fetch dogs for swiping
  const fetchDogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/dogs/discover', { token: accessToken });
      setDogs(response.dogs || []);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      Alert.alert('Error', 'Failed to load dogs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDogs();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [fetchDogs]);

  // Handle swipe action
  const handleSwipe = useCallback(async (action, cardIndex) => {
    if (cardIndex >= dogs.length || swiping) return;
    
    const currentDog = dogs[cardIndex];
    setSwiping(true);

    try {
      const response = await apiFetch('/api/matches/swipe', {
        method: 'POST',
        token: accessToken,
        body: {
          target_dog_id: currentDog.id,
          action: action
        }
      });

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
      console.error('Error swiping:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already swiped')) {
        console.log('Already swiped on this dog, continuing...');
      } else if (error.status === 400) {
        console.log('Swipe request failed (likely already swiped), continuing...');
      } else {
        Alert.alert('Error', 'Failed to process swipe. Please try again.');
      }
    } finally {
      setSwiping(false);
    }
  }, [dogs, accessToken, navigation, swiping]);

  // Render individual dog card with modern design
  const renderCard = useCallback((dog) => {
    return (
      <Animated.View style={styles.card} entering={FadeIn.duration(600)}>
        {/* Dog Photo with gradient overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: dog.photos && dog.photos.length > 0 
                ? (dog.photos[0].url.startsWith('http') 
                    ? dog.photos[0].url 
                    : `https://dogmatch-backend.onrender.com${dog.photos[0].url}`)
                : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face'
            }}
            style={styles.dogImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('Image load error:', error);
            }}
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face' }}
          />
          {/* Gradient overlay for better text readability */}
          <View style={styles.imageGradient} />
        </View>

        {/* Dog Info with modern design */}
        <View style={styles.dogInfo}>
          <View style={styles.nameAgeContainer}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.dogAge}>{dog.age} years</Text>
            </View>
          </View>
          
          <View style={styles.breedContainer}>
            <Text style={styles.dogBreed}>{dog.breed}</Text>
          </View>
          
          <Text style={styles.dogDescription} numberOfLines={3}>
            {dog.description}
          </Text>
          
          <View style={styles.traitsContainer}>
            <View style={styles.traitRow}>
              <View style={styles.traitBadge}>
                <Text style={styles.traitLabel}>Size</Text>
                <Text style={styles.traitValue}>{dog.size}</Text>
              </View>
              <View style={styles.traitBadge}>
                <Text style={styles.traitLabel}>Energy</Text>
                <Text style={styles.traitValue}>{dog.energy_level || 'Medium'}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }, []);

  // Modern overlay components for swipe feedback
  const OverlayLabelRight = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.likeOverlay]}
      entering={FadeIn.duration(300)}
    >
      <View style={styles.overlayIcon}>
        <Text style={styles.overlayEmoji}>💖</Text>
      </View>
      <Text style={styles.actionText}>LIKE</Text>
    </Animated.View>
  ), []);

  const OverlayLabelLeft = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.passOverlay]}
      entering={FadeIn.duration(300)}
    >
      <View style={styles.overlayIcon}>
        <Text style={styles.overlayEmoji}>✕</Text>
      </View>
      <Text style={styles.actionText}>PASS</Text>
    </Animated.View>
  ), []);

  const OverlayLabelTop = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.superLikeOverlay]}
      entering={FadeIn.duration(300)}
    >
      <View style={styles.overlayIcon}>
        <Text style={styles.overlayEmoji}>⭐</Text>
      </View>
      <Text style={styles.actionText}>SUPER LIKE</Text>
    </Animated.View>
  ), []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Finding perfect matches for you..." />
        </View>
      </SafeAreaView>
    );
  }

  if (dogs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.emptyContainer, headerAnimatedStyle]} entering={FadeIn.duration(800)}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>🐕</Text>
          </View>
          <Text style={styles.emptyTitle}>No more dogs to discover!</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new profiles or adjust your preferences.
          </Text>
          <AnimatedButton
            title="Refresh"
            onPress={fetchDogs}
            variant="outline"
            size="large"
            style={styles.refreshButton}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your perfect match</Text>
        </View>
        <TouchableOpacity 
          style={styles.matchesButton}
          onPress={() => navigation.navigate('Matches')}
        >
          <Text style={styles.matchesButtonText}>💕</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Swiper Container with modern design */}
      <Animated.View style={[styles.swiperContainer, cardAnimatedStyle]}>
        <Swiper
          ref={swiperRef}
          data={dogs}
          renderCard={renderCard}
          cardStyle={styles.swiperCard}
          overlayLabelContainerStyle={styles.overlayLabelContainerStyle}
          onSwipeLeft={(cardIndex) => handleSwipe('pass', cardIndex)}
          onSwipeRight={(cardIndex) => handleSwipe('like', cardIndex)}
          onSwipeTop={(cardIndex) => handleSwipe('super_like', cardIndex)}
          onSwipedAll={() => {
            Alert.alert('No More Dogs!', 'You\'ve seen all available dogs. Check back later for new matches!');
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

      {/* Modern Action Buttons */}
      <Animated.View style={[styles.actionButtons, cardAnimatedStyle]} entering={SlideInUp.delay(600).duration(600)}>
        <AnimatedButton
          title="✕"
          onPress={() => swiperRef.current?.swipeLeft()}
          disabled={swiping}
          variant="outline"
          size="large"
          style={[styles.actionButton, styles.passButton]}
        />
        
        <AnimatedButton
          title="⭐"
          onPress={() => swiperRef.current?.swipeTop()}
          disabled={swiping}
          variant="secondary"
          size="large"
          style={[styles.actionButton, styles.superLikeButton]}
        />
        
        <AnimatedButton
          title="💖"
          onPress={() => swiperRef.current?.swipeRight()}
          disabled={swiping}
          size="large"
          style={[styles.actionButton, styles.likeButton]}
        />
      </Animated.View>
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
    backgroundColor: Colors.background.primary,
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
  
  matchesButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  
  matchesButtonText: {
    fontSize: Typography.fontSize.lg,
  },
  
  swiperContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  
  swiperCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    ...Shadows.xl,
    overflow: 'hidden',
  },
  
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  
  dogImage: {
    width: '100%',
    height: '100%',
  },
  
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  
  dogInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
  },
  
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  dogName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  ageBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  
  dogAge: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  
  breedContainer: {
    marginBottom: Spacing.sm,
  },
  
  dogBreed: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  
  dogDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
    marginBottom: Spacing.md,
  },
  
  traitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  
  traitBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flex: 0.48,
  },
  
  traitLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  traitValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.md,
  },
  
  passButton: {
    borderColor: Colors.error[300],
  },
  
  superLikeButton: {
    backgroundColor: Colors.secondary[500],
  },
  
  likeButton: {
    backgroundColor: Colors.primary[500],
  },
  
  overlayLabelContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayLabelContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  
  likeOverlay: {
    backgroundColor: Colors.primary[500],
  },
  
  passOverlay: {
    backgroundColor: Colors.error[500],
  },
  
  superLikeOverlay: {
    backgroundColor: Colors.secondary[500],
  },
  
  overlayIcon: {
    marginBottom: Spacing.sm,
  },
  
  overlayEmoji: {
    fontSize: Typography.fontSize['2xl'],
  },
  
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
    marginBottom: Spacing.xl,
  },
  
  refreshButton: {
    paddingHorizontal: Spacing.xl,
  },
});

export default DiscoverScreen;
