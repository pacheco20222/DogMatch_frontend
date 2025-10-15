import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const PendingSwipesScreen = ({ navigation }) => {
  const { accessToken } = useAuth();
  const [pendingSwipes, setPendingSwipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  // Fetch pending swipes from API
  const fetchPendingSwipes = useCallback(async () => {
    try {
      setError(null);
      const response = await apiFetch('/api/matches/pending', {
        token: accessToken
      });
      
      if (response.success) {
        setPendingSwipes(response.pending_swipes || []);
      } else {
        setError(response.message || 'Failed to fetch pending swipes');
      }
    } catch (error) {
      console.error('Error fetching pending swipes:', error);
      setError('Failed to load pending swipes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  // Load pending swipes on mount and focus
  useFocusEffect(
    useCallback(() => {
      fetchPendingSwipes();
      
      // Animate header and cards
      headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
      cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
    }, [fetchPendingSwipes])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingSwipes();
  }, [fetchPendingSwipes]);

  // Handle swipe response
  const handleSwipeResponse = async (matchId, action) => {
    if (respondingTo) return; // Prevent multiple responses
    
    setRespondingTo(matchId);
    
    try {
      const response = await apiFetch(`/api/matches/${matchId}/respond`, {
        method: 'POST',
        token: accessToken,
        body: { action }
      });
      
      if (response.success) {
        // Show success message
        if (response.is_mutual_match) {
          Alert.alert(
            '🎉 It\'s a Match!',
            response.message,
            [
              {
                text: 'Start Chatting',
                onPress: () => {
                  // Navigate to chat
                  navigation.navigate('ChatConversation', {
                    matchId: matchId,
                    otherUser: response.match.other_user,
                    otherDog: response.match.other_dog,
                    match: response.match
                  });
                }
              },
              { text: 'OK' }
            ]
          );
        } else {
          Alert.alert('Success', response.message);
        }
        
        // Remove from pending list
        setPendingSwipes(prev => prev.filter(swipe => swipe.id !== matchId));
      } else {
        Alert.alert('Error', response.message || 'Failed to respond to swipe');
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
        entering={FadeInUp.delay(index * 100).duration(600)}
        style={styles.swipeCard}
      >
        {/* Dog Photo */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: otherDog.photos && otherDog.photos.length > 0 
                ? (otherDog.photos[0].url.startsWith('http') 
                    ? otherDog.photos[0].url 
                    : `https://dogmatch-backend.onrender.com${otherDog.photos[0].url}`)
                : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face'
            }}
            style={styles.dogImage}
            resizeMode="cover"
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop&crop=face' }}
          />
          <View style={styles.imageGradient} />
          
          {/* Swipe Action Badge */}
          <View style={styles.swipeActionBadge}>
            <Text style={styles.swipeActionText}>
              {swipe.other_dog_action === 'like' ? '❤️ Liked' : '⭐ Super Liked'}
            </Text>
          </View>
        </View>

        {/* Dog Info */}
        <View style={styles.dogInfo}>
          <View style={styles.nameAgeContainer}>
            <Text style={styles.dogName}>{otherDog.name}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.dogAge}>{otherDog.age} years</Text>
            </View>
          </View>
          
          <View style={styles.breedContainer}>
            <Text style={styles.dogBreed}>{otherDog.breed}</Text>
          </View>
          
          <Text style={styles.dogDescription} numberOfLines={2}>
            {otherDog.description}
          </Text>
          
          {/* Owner Info */}
          <View style={styles.ownerInfo}>
            <Image
              source={{
                uri: otherOwner?.profile_photo_url || 
                     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
              }}
              style={styles.ownerAvatar}
              defaultSource={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }}
            />
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>
                {otherOwner?.first_name} {otherOwner?.last_name}
              </Text>
              <Text style={styles.swipeTime}>
                {formatTimestamp(swipe.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipeResponse(swipe.id, 'pass')}
            disabled={isResponding}
          >
            <Text style={styles.passButtonText}>✕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipeResponse(swipe.id, 'like')}
            disabled={isResponding}
          >
            <Text style={styles.likeButtonText}>❤️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => handleSwipeResponse(swipe.id, 'super_like')}
            disabled={isResponding}
          >
            <Text style={styles.superLikeButtonText}>⭐</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.emptyState}
    >
      <Text style={styles.emptyStateIcon}>💝</Text>
      <Text style={styles.emptyStateTitle}>No pending swipes</Text>
      <Text style={styles.emptyStateSubtitle}>
        When someone swipes on your dog, you'll see it here!
      </Text>
    </Animated.View>
  );

  // Render error state
  const renderErrorState = () => (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.errorState}
    >
      <Text style={styles.errorStateIcon}>⚠️</Text>
      <Text style={styles.errorStateTitle}>Failed to load pending swipes</Text>
      <Text style={styles.errorStateSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchPendingSwipes}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Animated header style
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Animated cards style
  const animatedCardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pending Swipes</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pending swipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Swipes</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : pendingSwipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <Animated.View style={[styles.content, animatedCardsStyle]}>
          <FlatList
            data={pendingSwipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPendingSwipe}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4F8EF7"
                colors={['#4F8EF7']}
              />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4F8EF7',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  swipeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
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
    height: 100,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  swipeActionBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dogInfo: {
    padding: 20,
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  ageBadge: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dogAge: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  breedContainer: {
    marginBottom: 8,
  },
  dogBreed: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  dogDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  swipeTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  passButtonText: {
    fontSize: 24,
    color: '#6B7280',
  },
  likeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  likeButtonText: {
    fontSize: 24,
  },
  superLikeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  superLikeButtonText: {
    fontSize: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F8EF7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default PendingSwipesScreen;
