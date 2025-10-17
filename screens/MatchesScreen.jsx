import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Surface, 
  Card, 
  Avatar, 
  Chip, 
  IconButton, 
  ActivityIndicator,
  Snackbar,
  Portal
} from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
  Layout,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMatches } from '../store/slices/matchesSlice';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const MatchesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { matches, loading, error } = useAppSelector(state => state.matches);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  // Fetch user's matches
  const loadMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      await dispatch(fetchMatches({ status: 'matched' }));
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadMatches();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, [loadMatches]);

  // Show error snackbar when error occurs
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

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
        <Card
          mode="elevated"
          style={styles.matchCard}
          onPress={() => handleChatPress(item)}
        >
          <Card.Content style={styles.matchContent}>
            <View style={styles.matchHeader}>
              <Avatar.Image
                size={60}
                source={{ 
                  uri: otherDog.photos && otherDog.photos.length > 0 
                    ? (otherDog.photos[0].url.startsWith('http')
                        ? otherDog.photos[0].url
                        : `https://dogmatch-backend.onrender.com${otherDog.photos[0].url}`)
                    : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face'
                }}
                style={styles.matchAvatar}
              />
              <View style={styles.onlineIndicator} />
              
              <View style={styles.matchInfo}>
                <Text variant="titleMedium" style={styles.matchName}>
                  {otherDog.name}
                </Text>
                <Text variant="bodyMedium" style={styles.ownerName}>
                  {otherOwner.first_name} {otherOwner.last_name}
                </Text>
                <Text variant="bodySmall" style={styles.matchDate}>
                  Matched {new Date(item.matched_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.matchActions}>
                <Chip 
                  icon="heart" 
                  mode="flat" 
                  compact
                  style={styles.matchChip}
                >
                  Match
                </Chip>
                <IconButton
                  icon="message"
                  size={20}
                  onPress={() => handleChatPress(item)}
                  style={styles.chatButton}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading your matches...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Modern Header */}
      <Surface style={[styles.header, headerAnimatedStyle]} elevation={2}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={styles.title}>Your Matches</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </Text>
        </View>
      </Surface>

      {matches.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No matches yet!"
          subtitle="Start swiping in the Discover tab to find your dog's perfect playmate."
          actionText="Start Discovering"
          onActionPress={() => navigation.navigate('Discover')}
        />
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
                onRefresh={() => loadMatches(true)}
                colors={[Colors.primary[500]]}
                tintColor={Colors.primary[500]}
              />
            }
          />
        </Animated.View>
      )}

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Retry',
            onPress: () => {
              setSnackbarVisible(false);
              loadMatches();
            },
          }}
        >
          {error || 'Failed to load matches'}
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
  },
  
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
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
    padding: Spacing.md,
  },
  
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  matchAvatar: {
    marginRight: Spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  matchChip: {
    backgroundColor: Colors.primary[100],
  },
  
  chatButton: {
    margin: 0,
  },
});

export default MatchesScreen;
