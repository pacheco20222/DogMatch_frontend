import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet,
  RefreshControl
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Surface, FAB, Chip, Avatar } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { getUserTypeDisplayName, getUserTypeColor } from '../utils/permissions';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMatches } from '../store/slices/matchesSlice';
import { fetchMyDogs } from '../store/slices/dogsSlice';
import { fetchEvents } from '../store/slices/eventsSlice';
import { selectDashboardStats } from '../store/selectors';
import AnimatedButton from '../components/AnimatedButton';
import StatCard from '../components/ui/StatCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const { loading: matchesLoading } = useAppSelector(state => state.matches);
  const { loading: dogsLoading } = useAppSelector(state => state.dogs);
  const { loading: eventsLoading } = useAppSelector(state => state.events);
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  const loading = matchesLoading || dogsLoading || eventsLoading;

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      // Fetch user's stats using Redux async thunks
      await Promise.all([
        dispatch(fetchMatches({ status: 'matched' })),
        dispatch(fetchMyDogs()),
        dispatch(fetchEvents())
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl }]}
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
            <Text variant="displaySmall" style={styles.greeting}>{getGreeting()}!</Text>
            <Text variant="headlineMedium" style={styles.userName}>
              {user?.first_name || user?.username || 'User'}
            </Text>
            <Chip 
              style={[styles.roleBadge, { backgroundColor: getUserTypeColor(user?.user_type) }]}
              textStyle={styles.roleText}
            >
              {getUserTypeDisplayName(user?.user_type)}
            </Chip>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Matches"
              value={stats.matches}
              icon="heart"
              color="primary"
              onPress={() => navigation.navigate('Matches')}
            />
            <StatCard
              title="Dogs"
              value={stats.dogs}
              icon="dog"
              color="secondary"
              onPress={() => navigation.navigate('MyDogs')}
            />
            <StatCard
              title="Events"
              value={stats.events}
              icon="calendar"
              color="success"
              onPress={() => navigation.navigate('Events')}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(400).duration(600)}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>Quick Actions</Text>
          <Surface style={styles.actionsCard} elevation={2}>
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
          </Surface>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View style={[styles.activityContainer, cardsAnimatedStyle]} entering={FadeIn.delay(600).duration(600)}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>Recent Activity</Text>
          <Surface style={styles.activityCard} elevation={1}>
            <View style={styles.activityItem}>
              <Avatar.Icon icon="party-popper" size={40} style={styles.activityIcon} />
              <View style={styles.activityContent}>
                <Text variant="titleMedium" style={styles.activityTitle}>Welcome to DogMatch!</Text>
                <Text variant="bodyMedium" style={styles.activityDescription}>
                  Start by adding your first dog profile to begin matching.
                </Text>
              </View>
            </View>
          </Surface>
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
