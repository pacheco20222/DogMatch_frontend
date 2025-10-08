import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { Swiper } from 'rn-swiper-list';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import GlobalStyles from '../styles/GlobalStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.55;

export default function DiscoverScreen({ navigation }) {
  const { user, accessToken } = useContext(AuthContext);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const swiperRef = useRef();

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
        // Don't show alert for already swiped - just continue to next card
        console.log('Already swiped on this dog, continuing...');
      } else if (error.status === 400) {
        // Handle 400 errors (like already swiped) silently
        console.log('Swipe request failed (likely already swiped), continuing...');
      } else {
        // Show alert for other errors
        Alert.alert('Error', 'Failed to process swipe. Please try again.');
      }
    } finally {
      setSwiping(false);
    }
  }, [dogs, accessToken, navigation, swiping]);

  // Render individual dog card
  const renderCard = useCallback((dog) => {
    return (
      <View style={styles.card}>
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
        </View>

        {/* Dog Info */}
        <View style={styles.dogInfo}>
          <View style={styles.nameAgeContainer}>
            <Text style={styles.dogName}>{dog.name}</Text>
            <Text style={styles.dogAge}> {dog.age} years old</Text>
          </View>
          <Text style={styles.dogBreed}>{dog.breed}</Text>
          <Text style={styles.dogDescription}>{dog.description}</Text>
          
          <View style={styles.traitsContainer}>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Size:</Text>
              <Text style={styles.traitValue}> {dog.size}</Text>
            </View>
            <View style={styles.traitRow}>
              <Text style={styles.traitLabel}>Energy:</Text>
              <Text style={styles.traitValue}> {dog.energy_level || 'Medium'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, []);

  // Overlay components for swipe feedback
  const OverlayLabelRight = useCallback(() => (
    <View style={[styles.overlayLabelContainer, styles.likeOverlay]}>
      <Text style={styles.actionText}>LIKE</Text>
    </View>
  ), []);

  const OverlayLabelLeft = useCallback(() => (
    <View style={[styles.overlayLabelContainer, styles.passOverlay]}>
      <Text style={styles.actionText}>PASS</Text>
    </View>
  ), []);

  const OverlayLabelTop = useCallback(() => (
    <View style={[styles.overlayLabelContainer, styles.superLikeOverlay]}>
      <Text style={styles.actionText}>SUPER LIKE</Text>
    </View>
  ), []);


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

  if (dogs.length === 0) {
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
      </View>

      {/* Swiper Container */}
      <View style={styles.swiperContainer}>
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
      </View>

      {/* Action Buttons with proper spacing */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
          disabled={swiping}
        >
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => swiperRef.current?.swipeTop()}
          disabled={swiping}
        >
          <Text style={styles.actionButtonText}>⭐</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
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
    paddingBottom: 20, // Increased bottom padding
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
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
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  swiperCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
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
  overlayLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  overlayLabelContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 180, // Reduced height to fit better in smaller card
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
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 20, // Reduced bottom margin
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    width: 55, // Reduced button size
    height: 55, // Reduced button size
    borderRadius: 27.5, // Adjusted for new size
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12, // Reduced horizontal margin
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