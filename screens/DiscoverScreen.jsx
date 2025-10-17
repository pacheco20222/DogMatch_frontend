import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Image, 
  Alert, 
  Dimensions,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swiper } from 'rn-swiper-list';
import {
  Text,
  Surface,
  Chip,
  IconButton,
  Button,
  Avatar,
  ActivityIndicator,
  Snackbar,
  Portal,
  Badge,
} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  interpolate,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchDiscoverDogs, clearError } from '../store/slices/dogsSlice';
import { swipeDog, fetchPendingSwipes, clearError as clearMatchesError } from '../store/slices/matchesSlice';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.6;

const DiscoverScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { discoverDogs, discoverLoading, error: dogsError } = useAppSelector(state => state.dogs);
  const { pendingSwipes, pendingLoading, error: matchesError } = useAppSelector(state => state.matches);
  const [swiping, setSwiping] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const swiperRef = useRef();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);

  // Load dogs for swiping
  const loadDogs = useCallback(async () => {
    try {
      await dispatch(fetchDiscoverDogs()).unwrap();
    } catch (e) {
      setSnackbarVisible(true);
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
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [loadDogs, loadPendingSwipes]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMatchesError());
    };
  }, [dispatch]);

  // Handle swipe action
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
  }, [discoverDogs, dispatch, navigation, swiping]);

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

        {/* Dog Info with Paper components */}
        <Surface style={styles.dogInfo} elevation={4}>
          <View style={styles.nameAgeContainer}>
            <Text variant="headlineSmall" style={styles.dogName}>
              {dog.name}
            </Text>
            <Chip 
              mode="outlined" 
              compact 
              style={styles.ageChip}
              textStyle={styles.ageChipText}
            >
              {dog.age} years
            </Chip>
          </View>
          
          <View style={styles.breedContainer}>
            <Text variant="titleMedium" style={styles.dogBreed}>
              {dog.breed}
            </Text>
          </View>
          
          {/* Owner Information */}
          {dog.owner && (
            <View style={styles.ownerContainer}>
              <Avatar.Icon 
                size={24} 
                icon="account" 
                style={styles.ownerAvatar}
              />
              <Text variant="bodySmall" style={styles.ownerName}>
                {dog.owner.first_name} {dog.owner.last_name}
              </Text>
            </View>
          )}
          
          <Text variant="bodyMedium" style={styles.dogDescription} numberOfLines={3}>
            {dog.description}
          </Text>
          
          <View style={styles.traitsContainer}>
            <View style={styles.traitRow}>
              <Chip 
                mode="outlined" 
                compact 
                icon="ruler"
                style={styles.traitChip}
                textStyle={styles.traitChipText}
              >
                {dog.size}
              </Chip>
              <Chip 
                mode="outlined" 
                compact 
                icon="lightning-bolt"
                style={styles.traitChip}
                textStyle={styles.traitChipText}
              >
                {dog.energy_level || 'Medium'}
              </Chip>
            </View>
          </View>
        </Surface>
      </Animated.View>
    );
  }, []);

  // Modern overlay components for swipe feedback
  const OverlayLabelRight = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.likeOverlay]}
      entering={FadeIn.duration(300)}
    >
      <Avatar.Icon 
        size={48} 
        icon="heart" 
        style={styles.overlayIcon}
      />
      <Text variant="titleMedium" style={styles.actionText}>LIKE</Text>
    </Animated.View>
  ), []);

  const OverlayLabelLeft = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.passOverlay]}
      entering={FadeIn.duration(300)}
    >
      <Avatar.Icon 
        size={48} 
        icon="close" 
        style={styles.overlayIcon}
      />
      <Text variant="titleMedium" style={styles.actionText}>PASS</Text>
    </Animated.View>
  ), []);

  const OverlayLabelTop = useCallback(() => (
    <Animated.View 
      style={[styles.overlayLabelContainer, styles.superLikeOverlay]}
      entering={FadeIn.duration(300)}
    >
      <Avatar.Icon 
        size={48} 
        icon="star" 
        style={styles.overlayIcon}
      />
      <Text variant="titleMedium" style={styles.actionText}>SUPER LIKE</Text>
    </Animated.View>
  ), []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  if (discoverLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Finding perfect matches for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (discoverDogs.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Animated.View style={[styles.emptyContainer, headerAnimatedStyle]} entering={FadeIn.duration(800)}>
          <EmptyState
            icon="dog"
            title="No more dogs to discover!"
            subtitle="Check back later for new profiles or adjust your preferences."
            action={{
              label: "Refresh",
              onPress: loadDogs
            }}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <Surface style={styles.headerSurface} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.title}>
                Discover
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Find your perfect match
              </Text>
            </View>
            <View style={styles.headerButtons}>
              {pendingSwipes.length > 0 && (
                <IconButton
                  icon="heart-multiple"
                  size={24}
                  style={styles.pendingSwipesButton}
                  onPress={() => navigation.navigate('PendingSwipes')}
                />
              )}
              <IconButton
                icon="heart"
                size={24}
                style={styles.matchesButton}
                onPress={() => navigation.navigate('Matches')}
              />
            </View>
          </View>
        </Surface>
      </Animated.View>

      {/* Swiper Container with modern design */}
      <Animated.View style={[styles.swiperContainer, cardAnimatedStyle]}>
        <Swiper
          ref={swiperRef}
          data={discoverDogs}
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
        <IconButton
          icon="close"
          size={32}
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
          disabled={swiping}
        />
        
        <IconButton
          icon="star"
          size={32}
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => swiperRef.current?.swipeTop()}
          disabled={swiping}
        />
        
        <IconButton
          icon="heart"
          size={32}
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
          disabled={swiping}
        />
      </Animated.View>

      {/* Snackbar for errors */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {dogsError || matchesError || 'Something went wrong'}
        </Snackbar>
      </Portal>
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
    gap: Spacing.md,
  },
  
  loadingText: {
    color: Colors.text.secondary,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  
  headerSurface: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    color: Colors.text.primary,
    marginBottom: -Spacing.xs,
  },
  
  subtitle: {
    color: Colors.text.secondary,
  },
  
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  pendingSwipesButton: {
    backgroundColor: Colors.secondary[50],
    borderWidth: 1,
    borderColor: Colors.secondary[200],
  },
  
  matchesButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  
  swiperCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
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
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  
  dogName: {
    color: Colors.text.primary,
    flex: 1,
  },
  
  ageChip: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
  },
  
  ageChipText: {
    color: Colors.primary[700],
    fontSize: Typography.fontSize.xs,
  },
  
  breedContainer: {
    marginBottom: Spacing.sm,
  },
  
  dogBreed: {
    color: Colors.text.secondary,
  },
  
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  
  ownerAvatar: {
    backgroundColor: Colors.primary[200],
  },
  
  ownerName: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  
  dogDescription: {
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  
  traitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    gap: Spacing.sm,
  },
  
  traitChip: {
    backgroundColor: Colors.neutral[50],
    borderColor: Colors.neutral[200],
    flex: 1,
  },
  
  traitChipText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xs,
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    gap: Spacing.lg,
  },
  
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  
  passButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
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
  
  actionText: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
});

export default DiscoverScreen;
