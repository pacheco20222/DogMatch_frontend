import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
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
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { getUserTypeDisplayName, getUserTypeColor } from '../utils/permissions';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const HomeScreen = ({ navigation }) => {
  const { user, accessToken } = useContext(AuthContext);
  const [stats, setStats] = useState({
    matches: 0,
    dogs: 0,
    events: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch user's stats
      const [matchesResponse, dogsResponse, eventsResponse] = await Promise.all([
        apiFetch('/api/matches?status=matched', { token: accessToken }).catch(() => ({ matches: [] })),
        apiFetch('/api/dogs/my-dogs', { token: accessToken }).catch(() => ({ dogs: [] })),
        apiFetch('/api/events', { token: accessToken }).catch(() => ({ events: [] }))
      ]);

      setStats({
        matches: matchesResponse.matches?.length || 0,
        dogs: dogsResponse.dogs?.length || 0,
        events: eventsResponse.events?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchStats(true)}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {/* Welcome Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.userName}>
              {user?.first_name || user?.username || 'User'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: getUserTypeColor(user?.user_type) }]}>
              <Text style={styles.roleText}>
                {getUserTypeDisplayName(user?.user_type)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <AnimatedCard variant="elevated" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.matches}</Text>
                <Text style={styles.statLabel}>Matches</Text>
                <Text style={styles.statIcon}>💕</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard variant="elevated" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.dogs}</Text>
                <Text style={styles.statLabel}>Dogs</Text>
                <Text style={styles.statIcon}>🐕</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard variant="elevated" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.events}</Text>
                <Text style={styles.statLabel}>Events</Text>
                <Text style={styles.statIcon}>📅</Text>
              </View>
            </AnimatedCard>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(400).duration(600)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <AnimatedCard variant="outlined" style={styles.actionsCard}>
            <AnimatedButton
              title="Add New Dog"
              onPress={() => navigation.navigate('AddDog')}
              size="large"
              style={styles.actionButton}
            />
            
            <AnimatedButton
              title="Start Swiping"
              onPress={() => navigation.navigate('Discover')}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
            
            <AnimatedButton
              title="Browse Events"
              onPress={() => navigation.navigate('Events')}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          </AnimatedCard>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View style={[styles.activityContainer, cardsAnimatedStyle]} entering={FadeIn.delay(600).duration(600)}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <AnimatedCard variant="flat" style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>🎉</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Welcome to DogMatch!</Text>
                <Text style={styles.activityDescription}>
                  Start by adding your first dog profile to begin matching.
                </Text>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  header: {
    marginBottom: Spacing.xl,
  },
  
  welcomeSection: {
    alignItems: 'flex-start',
  },
  
  greeting: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  userName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  roleText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statCard: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  
  statContent: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  statNumber: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
  },
  
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  
  statIcon: {
    fontSize: Typography.fontSize.xl,
  },
  
  actionsContainer: {
    marginBottom: Spacing.xl,
  },
  
  actionsCard: {
    marginBottom: Spacing.lg,
  },
  
  actionButton: {
    marginBottom: Spacing.md,
  },
  
  activityContainer: {
    marginBottom: Spacing.xl,
  },
  
  activityCard: {
    marginBottom: Spacing.lg,
  },
  
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  activityIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  activityDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export default HomeScreen;
