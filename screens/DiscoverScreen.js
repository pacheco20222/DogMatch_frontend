import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import GlobalStyles from '../styles/GlobalStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.65; // Reduced height for better spacing
const SWIPE_THRESHOLD = screenWidth * 0.25; // Reduced threshold for easier swiping
const ROTATION_MULTIPLIER = 0.1; // Smoother rotation

export default function DiscoverScreen({ navigation }) {
  const { user, accessToken } = useContext(AuthContext);
  const [dogs, setDogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  // Animated values for the current card
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

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
  }, [fetchDogs]);

  // Handle swipe action
  const handleSwipe = useCallback(async (action) => {
    if (currentIndex >= dogs.length || swiping) return;
    
    const currentDog = dogs[currentIndex];
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

      // Move to next card
      setCurrentIndex(prev => prev + 1);
      
    } catch (error) {
      console.error('Error swiping:', error);
      Alert.alert('Error', 'Failed to process swipe. Please try again.');
    } finally {
      setSwiping(false);
    }
  }, [currentIndex, dogs, accessToken, navigation, swiping]);

  // Enhanced gesture handler with smooth finger tracking
  const onGestureEvent = (event) => {
    'worklet';
    // Real-time finger tracking - card follows finger exactly
    translateX.value = event.translationX;
    translateY.value = event.translationY;
    
    // Smoother rotation calculation
    rotate.value = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-30, 0, 30],
      Extrapolate.CLAMP
    ) * ROTATION_MULTIPLIER;
    
    // Enhanced scale for super like with more dramatic effect
    scale.value = interpolate(
      translateY.value,
      [-150, 0, 50],
      [1.15, 1, 0.95],
      Extrapolate.CLAMP
    );
    
    // Debug logging
    runOnJS(console.log)('Gesture Event:', {
      translationX: event.translationX,
      translationY: event.translationY,
      state: event.state
    });
  };

  const onHandlerStateChange = (event) => {
    'worklet';
    runOnJS(console.log)('State Change:', {
      state: event.nativeEvent.state,
      translateX: translateX.value,
      translateY: translateY.value
    });
    
    if (event.nativeEvent.state === State.END) {
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const shouldSuperLike = translateY.value < -100;
      
      runOnJS(console.log)('Swipe Decision:', {
        shouldSwipeLeft,
        shouldSwipeRight,
        shouldSuperLike,
        threshold: SWIPE_THRESHOLD
      });

      if (shouldSuperLike) {
        // Super like animation - full screen movement
        translateY.value = withTiming(-screenHeight * 1.5, { duration: 400 });
        translateX.value = withTiming(0, { duration: 400 });
        rotate.value = withTiming(0, { duration: 400 });
        scale.value = withTiming(1.2, { duration: 400 });
        runOnJS(handleSwipe)('super_like');
      } else if (shouldSwipeLeft) {
        // Pass animation - full screen movement with rotation
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 400 });
        translateY.value = withTiming(0, { duration: 400 });
        rotate.value = withTiming(-30, { duration: 400 });
        scale.value = withTiming(0.8, { duration: 400 });
        runOnJS(handleSwipe)('pass');
      } else if (shouldSwipeRight) {
        // Like animation - full screen movement with rotation
        translateX.value = withTiming(screenWidth * 1.5, { duration: 400 });
        translateY.value = withTiming(0, { duration: 400 });
        rotate.value = withTiming(30, { duration: 400 });
        scale.value = withTiming(0.8, { duration: 400 });
        runOnJS(handleSwipe)('like');
      } else {
        // Enhanced snap back with spring physics
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 1,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 1,
        });
        rotate.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 1,
        });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
          mass: 1,
        });
      }
    }
  };

  // Enhanced animated style for the current card with shadow effects
  const animatedCardStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      Math.abs(translateX.value) + Math.abs(translateY.value),
      [0, 100],
      [0.25, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      shadowOpacity,
      elevation: interpolate(
        Math.abs(translateX.value) + Math.abs(translateY.value),
        [0, 100],
        [5, 15],
        Extrapolate.CLAMP
      ),
    };
  });

  // Action overlay styles - moved to top level to fix hooks violation
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 30, SWIPE_THRESHOLD],
      [0, 0.3, 1],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [0.8, 1.2],
          Extrapolate.CLAMP
        )
      }
    ]
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -30, 0],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD, 0],
          [1.2, 0.8],
          Extrapolate.CLAMP
        )
      }
    ]
  }));

  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-100, -50, 0],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateY.value,
          [-100, 0],
          [1.3, 0.8],
          Extrapolate.CLAMP
        )
      }
    ]
  }));

  // Reset animation values when moving to next card
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    rotate.value = 0;
    scale.value = 1;
  }, [currentIndex]);

  const renderDogCard = (dog, index) => {
    if (index !== currentIndex) return null;

    return (
      <PanGestureHandler 
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        activeOffsetY={[-10, 10]}
      >
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Dog Photo */}
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
            
            {/* Enhanced Action Overlays with better visual feedback */}
            <Animated.View style={[styles.actionOverlay, styles.likeOverlay, likeOverlayStyle]}>
              <Text style={styles.actionText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.actionOverlay, styles.passOverlay, passOverlayStyle]}>
              <Text style={styles.actionText}>PASS</Text>
            </Animated.View>
            <Animated.View style={[styles.actionOverlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
              <Text style={styles.actionText}>SUPER LIKE</Text>
            </Animated.View>
          </View>

          {/* Dog Info */}
          <View style={styles.dogInfo}>
            <View style={styles.nameAgeContainer}>
              <Text style={styles.dogName}>{dog.name}</Text>
              <Text style={styles.dogAge}>{dog.age} years old</Text>
            </View>
            
            <Text style={styles.dogBreed}>{dog.breed}</Text>
            
            {dog.description && (
              <Text style={styles.dogDescription} numberOfLines={3}>
                {dog.description}
              </Text>
            )}

            {/* Dog Traits */}
            <View style={styles.traitsContainer}>
              <View style={styles.traitRow}>
                <Text style={styles.traitLabel}>Size:</Text>
                <Text style={styles.traitValue}>{dog.size}</Text>
              </View>
              <View style={styles.traitRow}>
                <Text style={styles.traitLabel}>Energy:</Text>
                <Text style={styles.traitValue}>{dog.energy_level}</Text>
              </View>
              <View style={styles.traitRow}>
                <Text style={styles.traitLabel}>Good with kids:</Text>
                <Text style={styles.traitValue}>{dog.good_with_kids ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={styles.loadingText}>Finding dogs for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= dogs.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No more dogs to discover!</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new profiles or adjust your preferences.
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setCurrentIndex(0);
              fetchDogs();
            }}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>
          {currentIndex + 1} of {dogs.length} dogs
        </Text>
      </View>

      {/* Card Container with proper spacing */}
      <View style={styles.cardContainer}>
        {renderDogCard(dogs[currentIndex], currentIndex)}
      </View>

      {/* Action Buttons with proper spacing */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('pass')}
          disabled={swiping}
        >
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleSwipe('super_like')}
          disabled={swiping}
        >
          <Text style={styles.actionButtonText}>⭐</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('like')}
          disabled={swiping}
        >
          <Text style={styles.actionButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30, // Increased top padding
    paddingBottom: 30, // Increased bottom padding
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  dogImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  likeOverlay: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  passOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
  },
  actionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dogInfo: {
    padding: 20,
    height: 200,
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  dogAge: {
    fontSize: 18,
    color: '#6B7280',
  },
  dogBreed: {
    fontSize: 16,
    color: '#4F8EF7',
    marginBottom: 8,
  },
  dogDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  traitsContainer: {
    flex: 1,
  },
  traitRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  traitLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
  },
  traitValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 40,
    marginBottom: 30, // Increased bottom margin
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#EF4444',
  },
  superLikeButton: {
    backgroundColor: '#3B82F6',
  },
  likeButton: {
    backgroundColor: '#22C55E',
  },
  actionButtonText: {
    fontSize: 24,
    color: 'white',
  },
});