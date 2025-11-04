import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Heart, 
  MessageCircle, 
  Calendar,
  ChevronLeft,
  Sparkles
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMatches } from '../store/slices/matchesSlice';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';
import { logger } from '../utils/logger';
import EmptyState from '../components/ui/EmptyState';
import { GlassCard } from '../components/glass';

const MatchesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { matches, loading, error } = useAppSelector(state => state.matches);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const int = parseInt(full, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Fetch user's matches
  const loadMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      await dispatch(fetchMatches({ status: 'matched' }));
    } catch (error) {
      logger.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Show error snackbar when error occurs
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleChatPress = (match) => {
    // Navigate to chat conversation (nested in Chats tab)
    navigation.navigate('Chats', {
      screen: 'ChatConversation',
      params: {
        matchId: match.id,
        otherUser: match.other_dog?.owner,
        otherDog: match.other_dog,
        match: match
      }
    });
  };

  const renderMatch = ({ item, index }) => {
    const otherDog = item.other_dog;
    const otherOwner = otherDog.owner;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
        className="mb-4 mx-4"
      >
        <TouchableOpacity
          onPress={() => handleChatPress(item)}
          activeOpacity={0.9}
        >
          <GlassCard>
            <View className="flex-row items-center">
              {/* Dog Avatar */}
              <View className="relative mr-4">
                  <Image
                    source={{ 
                      uri: otherDog.primary_photo_url && otherDog.primary_photo_url !== '/static/images/default-dog.jpg'
                        ? otherDog.primary_photo_url
                        : (otherDog.photos && otherDog.photos.length > 0 
                            ? otherDog.photos[0].url
                            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face')
                    }}
                    style={{ width: 64, height: 64, borderRadius: 999 }}
                  />
                  {/* Match Badge */}
                  <View style={{ position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: 999, backgroundColor: tokens.overlaySuperLikeBg || hexToRgba('#EC4899', 0.9), alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: tokens.primaryContrast }}>
                    <Heart size={12} color={tokens.primaryContrast} />
                  </View>
                </View>

              {/* Match Info */}
              <View className="flex-1">
                <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                  {otherDog.name}
                </Text>
                <Text style={{ color: tokens.textSecondary, fontSize: 14, marginBottom: 4 }}>
                  {otherOwner.first_name} {otherOwner.last_name}
                </Text>
                <View className="flex-row items-center">
                  <Calendar size={12} color={tokens.textSecondary} />
                  <Text style={{ color: tokens.textSecondary, fontSize: 12, marginLeft: 6 }}>
                    Matched {new Date(item.matched_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Chat Button */}
              <TouchableOpacity
                onPress={() => handleChatPress(item)}
                className="w-12 h-12 rounded-full items-center justify-center"
                activeOpacity={0.8}
                style={{ width: 48, height: 48, borderRadius: 999, backgroundColor: tokens.primary }}
              >
                <MessageCircle size={20} color={tokens.primaryContrast} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={tokens.gradientBackground}
          className="absolute top-0 left-0 right-0 h-64"
        />

        <SafeAreaView className="flex-1" edges={['top']}>
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="px-6 py-6 flex-row items-center"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <View style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : tokens.cardBackground }}>
                <ChevronLeft size={24} color={isDark ? tokens.textPrimary : tokens.textPrimary} />
              </View>
            </TouchableOpacity>
            
            <View>
              <Text style={{ color: tokens.textPrimary, fontSize: 28, fontWeight: '700' }}>
                Matches
              </Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 16, marginTop: 4 }}>
                Loading...
              </Text>
            </View>
          </Animated.View>

          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={tokens.primary} />
            <Text style={{ marginTop: 12, fontSize: 16, color: tokens.textSecondary }}>
              Loading your matches...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={tokens.gradientBackground}
        className="absolute top-0 left-0 right-0 h-64"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.duration(400)}
          className="px-6 py-6"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mr-4"
              >
                <View style={{ width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : tokens.cardBackground }}>
                  <ChevronLeft size={24} color={tokens.textPrimary} />
                </View>
              </TouchableOpacity>
              
              <View>
                <Text style={{ color: tokens.textPrimary, fontSize: 28, fontWeight: '700' }}>
                  Your Matches
                </Text>
                <Text style={{ color: tokens.textSecondary, fontSize: 16, marginTop: 4 }}>
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </Text>
              </View>
            </View>

            {/* Sparkles Icon */}
            {matches.length > 0 && (
              <View style={{ width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: hexToRgba('#EC4899', 0.12) }}>
                <Sparkles size={24} color={'#EC4899'} />
              </View>
            )}
          </View>
        </Animated.View>

        {matches.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No matches yet!"
            description="Start swiping in the Discover tab to find your dog's perfect playmate."
            actionLabel="Start Discovering"
            onAction={() => navigation.navigate('Discover')}
          />
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadMatches(true)}
                colors={[tokens.primary]}
                tintColor={tokens.primary}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};


export default MatchesScreen;
