import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Dog, Calendar, Plus, Sparkles, Activity } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { getUserTypeDisplayName, getUserTypeColor } from '../utils/permissions';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMatches } from '../store/slices/matchesSlice';
import { fetchMyDogs } from '../store/slices/dogsSlice';
import { fetchEvents } from '../store/slices/eventsSlice';
import { selectDashboardStats } from '../store/selectors';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard, GlassButton, GradientText } from '../components/glass';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const { loading: matchesLoading } = useAppSelector(state => state.matches);
  const { loading: dogsLoading } = useAppSelector(state => state.dogs);
  const { loading: eventsLoading } = useAppSelector(state => state.events);
  const insets = useSafeAreaInsets();
  
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const sparkleRotate = useSharedValue(0);

  const loading = matchesLoading || dogsLoading || eventsLoading;

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

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
    
    // Sparkle rotation animation
    sparkleRotate.value = withRepeat(
      withSequence(
        withSpring(15, { damping: 10 }),
        withSpring(-15, { damping: 10 }),
        withSpring(0, { damping: 10 })
      ),
      -1,
      false
    );
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    return user?.full_name?.split(' ')[0] || user?.username || 'User';
  };

  const getUserTypeStyle = () => {
    const type = user?.user_type;
    switch (type) {
      case 'owner':
        return 'bg-primary-500/20 border-primary-500';
      case 'shelter':
        return 'bg-accent-500/20 border-accent-500';
      case 'admin':
        return 'bg-warning-500/20 border-warning-500';
      default:
        return 'bg-primary-500/20 border-primary-500';
    }
  };

  const getUserTypeTextColor = () => {
    const type = user?.user_type;
    switch (type) {
      case 'owner':
        return 'text-primary-500';
      case 'shelter':
        return 'text-accent-500';
      case 'admin':
        return 'text-warning-500';
      default:
        return 'text-primary-500';
    }
  };

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotate.value}deg` }],
  }));

  const statCards = [
    {
      title: 'Matches',
      value: stats.matches,
      icon: Heart,
      color: 'primary',
      bgColor: isDark ? 'bg-primary-500/20' : 'bg-primary-100',
      textColor: 'text-primary-500',
      onPress: () => navigation.navigate('Discover', { screen: 'Matches' }),
    },
    {
      title: 'Dogs',
      value: stats.dogs,
      icon: Dog,
      color: 'secondary',
      bgColor: isDark ? 'bg-secondary-500/20' : 'bg-secondary-100',
      textColor: 'text-secondary-500',
      onPress: () => navigation.navigate('MyDogs'),
    },
    {
      title: 'Events',
      value: stats.events,
      icon: Calendar,
      color: 'success',
      bgColor: isDark ? 'bg-accent-500/20' : 'bg-accent-100',
      textColor: 'text-accent-500',
      onPress: () => navigation.navigate('Events'),
    },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark 
          ? ['#312E81', '#1E293B', '#0F172A'] 
          : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
        }
        className="absolute top-0 left-0 right-0 h-80"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 20, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchStats(true)}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
        >
          {/* Welcome Header */}
          <Animated.View entering={FadeIn.duration(600)} className="mb-8">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getGreeting()}!
                </Text>
                <GradientText
                  colors={['#6366F1', '#EC4899', '#14B8A6']}
                  className="text-4xl font-bold mt-1"
                >
                  {getUserName()}
                </GradientText>
              </View>
              
              <Animated.View style={sparkleAnimatedStyle}>
                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                  isDark ? 'bg-primary-500/20' : 'bg-primary-100'
                }`}>
                  <Sparkles size={24} className="text-primary-500" />
                </View>
              </Animated.View>
            </View>

            <View className={`mt-3 px-3 py-1.5 rounded-full border-2 self-start ${getUserTypeStyle()}`}>
              <Text className={`text-sm font-semibold ${getUserTypeTextColor()}`}>
                {getUserTypeDisplayName(user?.user_type)}
              </Text>
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-8">
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Activity
            </Text>
            
            <View className="flex-row justify-between">
              {statCards.map((stat, index) => (
                <Animated.View 
                  key={stat.title}
                  entering={SlideInRight.delay(300 + index * 100).duration(500)}
                  className="flex-1 mx-1"
                >
                  <TouchableOpacity onPress={stat.onPress} activeOpacity={0.8}>
                    <GlassCard className="p-5">
                      <View className="items-center">
                        <View className={`w-14 h-14 rounded-2xl ${stat.bgColor} items-center justify-center mb-3`}>
                          <stat.icon size={28} className={stat.textColor} />
                        </View>
                        <Text className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                          {stat.value}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.title}
                        </Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mb-8">
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </Text>
            
            <GlassCard className="p-5">
              <GlassButton
                variant="primary"
                size="lg"
                icon={Plus}
                onPress={() => navigation.navigate('MyDogs', { screen: 'AddDog' })}
                className="w-full mb-3"
              >
                Add New Dog
              </GlassButton>

              <GlassButton
                variant="ghost"
                size="lg"
                icon={Heart}
                onPress={() => navigation.navigate('Discover')}
                className="w-full mb-3"
              >
                Start Swiping
              </GlassButton>

              <GlassButton
                variant="ghost"
                size="lg"
                icon={Calendar}
                onPress={() => navigation.navigate('Events')}
                className="w-full"
              >
                Browse Events
              </GlassButton>
            </GlassCard>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Activity
            </Text>
            
            <GlassCard className="p-6">
              <View className="flex-row items-start">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  isDark ? 'bg-accent-500/20' : 'bg-accent-100'
                }`}>
                  <Activity size={24} className="text-accent-500" />
                </View>
                
                <View className="flex-1">
                  <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Welcome to DogMatch!
                  </Text>
                  <Text className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start by adding your first dog profile to begin matching with amazing dogs in your area.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
