import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const MatchesScreen = ({ navigation }) => {
  const { user, accessToken } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  // Fetch user's matches
  const fetchMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await apiFetch('/api/matches?status=matched', { token: accessToken });
      setMatches(response.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchMatches();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [fetchMatches]);

  const handleChatPress = (match) => {
    // Navigate to chat conversation
    navigation.navigate('ChatConversation', {
      matchId: match.id,
      otherUser: match.other_user,
      otherDog: match.other_dog,
      match: match
    });
  };

  const renderMatch = ({ item, index }) => {
    const otherDog = item.other_dog;
    const otherOwner = otherDog.owner;

    return (
      <Animated.View
        entering={FadeIn.delay(index * 100).duration(600)}
        layout={Layout.springify()}
      >
        <AnimatedCard
          variant="elevated"
          style={styles.matchCard}
          onPress={() => handleChatPress(item)}
        >
          <View style={styles.matchContent}>
            <View style={styles.imageContainer}>
              <Image
                source={{ 
                  uri: otherDog.photos && otherDog.photos.length > 0 
                    ? (otherDog.photos[0].url.startsWith('http')
                        ? otherDog.photos[0].url
                        : `https://dogmatch-backend.onrender.com${otherDog.photos[0].url}`)
                    : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face'
                }}
                style={styles.matchImage}
                onError={() => {
                  console.log('Image failed to load for match:', otherDog.name);
                }}
              />
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{otherDog.name}</Text>
              <Text style={styles.ownerName}>
                {otherOwner.first_name} {otherOwner.last_name}
              </Text>
              <Text style={styles.matchDate}>
                Matched {new Date(item.matched_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.matchActions}>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>💕</Text>
              </View>
              <View style={styles.chatIndicator}>
                <Text style={styles.chatIcon}>💬</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </Animated.View>
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" text="Loading your matches..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Matches</Text>
          <Text style={styles.subtitle}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Text>
        </View>
      </Animated.View>

      {matches.length === 0 ? (
        <Animated.View style={styles.emptyContainer} entering={FadeIn.duration(800)}>
          <AnimatedCard variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>💕</Text>
              </View>
              <Text style={styles.emptyTitle}>No matches yet!</Text>
              <Text style={styles.emptySubtitle}>
                Start swiping in the Discover tab to find your dog's perfect playmate.
              </Text>
              <AnimatedButton
                title="Start Discovering"
                onPress={() => navigation.navigate('Discover')}
                size="large"
                style={styles.discoverButton}
              />
            </View>
          </AnimatedCard>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.matchesContainer, cardsAnimatedStyle]}>
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.matchesList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchMatches(true)}
                colors={[Colors.primary[500]]}
                tintColor={Colors.primary[500]}
              />
            }
          />
        </Animated.View>
      )}
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
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyCard: {
    width: '100%',
  },
  
  emptyContent: {
    alignItems: 'center',
    padding: Spacing.xl,
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
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  discoverButton: {
    paddingHorizontal: Spacing.xl,
  },
  
  matchesContainer: {
    flex: 1,
  },
  
  matchesList: {
    padding: Spacing.lg,
  },
  
  matchCard: {
    marginBottom: Spacing.lg,
  },
  
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  
  matchImage: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.full,
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success[500],
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  
  matchInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  matchName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  ownerName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  matchDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  
  matchActions: {
    alignItems: 'center',
  },
  
  matchBadge: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  matchBadgeText: {
    fontSize: Typography.fontSize.xl,
  },
  
  chatIndicator: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  chatIcon: {
    fontSize: Typography.fontSize.lg,
  },
});

export default MatchesScreen;
