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
import EmptyState from '../components/ui/EmptyState';
import { GlassCard } from '../components/glass';

const MatchesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { matches, loading, error } = useAppSelector(state => state.matches);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { isDark } = useTheme();

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
          <GlassCard className="p-4">
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
                  className="w-16 h-16 rounded-full"
                />
                {/* Match Badge */}
                <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pink-500 items-center justify-center border-2 border-white">
                  <Heart size={12} className="text-white" fill="white" />
                </View>
              </View>

              {/* Match Info */}
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {otherDog.name}
                </Text>
                <Text className={`text-sm mb-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {otherOwner.first_name} {otherOwner.last_name}
                </Text>
                <View className="flex-row items-center">
                  <Calendar size={12} className={isDark ? 'text-gray-500' : 'text-gray-500'} />
                  <Text className={`text-xs ml-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    Matched {new Date(item.matched_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Chat Button */}
              <TouchableOpacity
                onPress={() => handleChatPress(item)}
                className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center"
                activeOpacity={0.8}
              >
                <MessageCircle size={20} className="text-white" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Gradient Background */}
        <LinearGradient
          colors={isDark 
            ? ['#312E81', '#1E293B', '#0F172A'] 
            : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
          }
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
              <View className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? 'bg-white/10' : 'bg-white/70'
              }`}>
                <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
              </View>
            </TouchableOpacity>
            
            <View>
              <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Matches
              </Text>
              <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Loading...
              </Text>
            </View>
          </Animated.View>

          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className={`mt-4 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading your matches...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark 
          ? ['#312E81', '#1E293B', '#0F172A'] 
          : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
        }
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
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? 'bg-white/10' : 'bg-white/70'
                }`}>
                  <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
                </View>
              </TouchableOpacity>
              
              <View>
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Your Matches
                </Text>
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </Text>
              </View>
            </View>

            {/* Sparkles Icon */}
            {matches.length > 0 && (
              <View className="w-12 h-12 rounded-full bg-pink-500/20 items-center justify-center">
                <Sparkles size={24} className="text-pink-500" />
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
                colors={['#6366F1']}
                tintColor="#6366F1"
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};


export default MatchesScreen;
