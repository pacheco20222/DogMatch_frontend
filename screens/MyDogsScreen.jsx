import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  ScrollView, 
  Alert,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dog, Plus, Edit, Trash2, Ruler, User as UserIcon, Calendar, MoreVertical } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchMyDogs, clearError, deleteDog } from '../store/slices/dogsSlice';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { useTheme } from '../theme/ThemeContext';
import { getDesignTokens } from '../styles/designTokens';
import { GlassCard, FloatingActionButton, GlassButton, GradientText } from '../components/glass';

const MyDogsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { myDogs, loading, error } = useAppSelector(state => state.dogs);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const loadDogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      await dispatch(fetchMyDogs()).unwrap();
    } catch (e) {
      logger.error('Failed to load dogs:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDogs();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDogs();
    }, [])
  );

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleDeleteDog = (dogId, dogName) => {
    Alert.alert(
      'Delete Dog',
      `Are you sure you want to delete ${dogName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteDog(dogId)).unwrap();
              Alert.alert('Success', `${dogName} was deleted successfully`);
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete dog');
            }
          }
        }
      ]
    );
  };

  const handleEditDog = (dog) => {
    Alert.alert('Coming Soon', 'Edit dog functionality will be added soon!');
  };

  const getSizeIcon = (size) => {
    return Ruler;
  };

  const getGenderIcon = (gender) => {
    return UserIcon;
  };

  const renderDogCard = (dog, index) => (
    <Animated.View
      key={dog.id}
      entering={FadeInDown.delay(index * 100).duration(600)}
      layout={Layout.springify()}
      className="mb-4"
    >
  <GlassCard>
        {/* Dog Header with Photo and Info */}
        <View className="flex-row items-start mb-4">
          {/* Dog Photo */}
          <View className={`w-20 h-20 rounded-2xl overflow-hidden mr-4`} style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : tokens.cardBackground }}>
            {dog.primary_photo_url ? (
                <Image
                  source={{ 
                    uri: dog.primary_photo_url.startsWith('http') 
                      ? dog.primary_photo_url 
                      : `https://dogmatch-backend.onrender.com${dog.primary_photo_url}`
                  }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  transition={200}
                  cachePolicy="memory-disk"
                />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Dog size={32} color={tokens.primary} />
              </View>
            )}
          </View>

          {/* Dog Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text style={{ color: tokens.textPrimary, fontSize: 20, fontWeight: '700', flex: 1 }}>
                {dog.name}
              </Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : tokens.primary }}>
                <Text style={{ color: isDark ? tokens.primary : tokens.primaryContrast, fontSize: 12, fontWeight: '600' }}>
                  {dog.age_string || `${dog.age}y`}
                </Text>
              </View>
            </View>
            
            <Text style={{ color: tokens.textSecondary, fontSize: 14, marginBottom: 8 }}>
              {dog.breed}
            </Text>
            
            {/* Size and Gender Pills */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
              <View 
                key="size-pill"
                className="px-2 py-1 rounded-lg flex-row items-center"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : tokens.cardBackground }}
              >
                <Ruler size={12} color={tokens.textSecondary} />
                <Text style={{ color: tokens.textSecondary, marginLeft: 6, fontSize: 12 }}>{dog.size}</Text>
              </View>
              <View 
                key="gender-pill"
                className="px-2 py-1 rounded-lg flex-row items-center"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : tokens.cardBackground }}
              >
                <UserIcon size={12} color={tokens.textSecondary} />
                <Text style={{ color: tokens.textSecondary, marginLeft: 6, fontSize: 12 }}>{dog.gender}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {dog.description && (
          <View className="mb-4">
            <Text style={{ color: tokens.textSecondary, lineHeight: 20 }}>{dog.description}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            key="edit-button"
            onPress={() => handleEditDog(dog)}
            activeOpacity={0.7}
            className="flex-1"
          >
            <View style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : tokens.primary, borderWidth: isDark ? 0 : 1, borderColor: isDark ? 'transparent' : '#E0E7FF' }}>
              <Edit size={16} color={isDark ? tokens.primary : tokens.primaryContrast} style={{ marginRight: 8 }} />
              <Text style={{ color: isDark ? tokens.primary : tokens.primaryContrast, fontWeight: '600', fontSize: 14 }}>Edit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            key="delete-button"
            onPress={() => handleDeleteDog(dog.id, dog.name)}
            activeOpacity={0.7}
            className="flex-1"
          >
            <View style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.actionPassBg, borderWidth: isDark ? 0 : 1, borderColor: isDark ? 'transparent' : tokens.danger }}>
              <Trash2 size={16} color={tokens.danger} style={{ marginRight: 8 }} />
              <Text style={{ color: tokens.danger, fontWeight: '600', fontSize: 14 }}>Delete</Text>
            </View>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );

  // Loading State
  if (loading && !refreshing) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
          colors={isDark 
            ? ['#312E81', '#1E293B', '#0F172A'] 
            : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
          }
          className="absolute top-0 left-0 right-0 bottom-0"
        />
        <SafeAreaView className="flex-1 items-center justify-center" edges={['top']}>
          <ActivityIndicator size="large" color={tokens.primary} />
            <Text style={{ color: tokens.textSecondary, marginTop: 16, fontSize: 16 }}>Loading your dogs...</Text>
        </SafeAreaView>
      </View>
    );
  }

  // Empty State
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(600)} className="items-center justify-center px-6 py-12">
      <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : tokens.cardBackground }}>
          <Dog size={48} color={tokens.primary} />
        </View>
      <Text style={{ color: tokens.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>No dogs added yet</Text>
      <Text style={{ color: tokens.textSecondary, fontSize: 16, marginBottom: 24, textAlign: 'center' }}>Add your first dog to start connecting with other dog owners!</Text>
      <GlassButton
        variant="primary"
        size="lg"
        icon={Plus}
        onPress={() => navigation.navigate('AddDog')}
      >
        Add Your First Dog
      </GlassButton>
    </Animated.View>
  );

  // Error State
  const renderErrorState = () => (
    <Animated.View entering={FadeIn.duration(600)} className="items-center justify-center px-6 py-12">
      <Text className={`text-xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Oops! Something went wrong
      </Text>
      <Text className={`text-base text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {error}
      </Text>
      <GlassButton
        variant="primary"
        size="md"
        onPress={() => loadDogs()}
      >
        Try Again
      </GlassButton>
    </Animated.View>
  );

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
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <GradientText
                colors={['#6366F1', '#EC4899', '#14B8A6']}
                className="text-3xl font-bold mb-1"
              >
                My Dogs
              </GradientText>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your dog profiles
              </Text>
            </View>
            {myDogs.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AddDog')}
                activeOpacity={0.7}
                className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                  isDark ? 'bg-primary-500/20' : 'bg-primary-500'
                }`}
              >
                <Plus size={20} className={isDark ? 'text-primary-400' : 'text-white'} />
                <Text className={`text-sm font-semibold ml-1 ${isDark ? 'text-primary-400' : 'text-white'}`}>
                  Add Dog
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDogs(true)}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
        >
          {error ? (
            renderErrorState()
          ) : myDogs.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Dogs Count */}
              <Animated.View entering={FadeIn.duration(600)} className="mb-4">
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {myDogs.length} dog{myDogs.length !== 1 ? 's' : ''}
                </Text>
              </Animated.View>

              {/* Dogs List */}
              {myDogs.map((dog, index) => renderDogCard(dog, index))}
            </>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        {myDogs.length > 0 && (
          <FloatingActionButton
            icon={Plus}
            onPress={() => navigation.navigate('AddDog')}
            variant="primary"
            size="md"
            position="bottom-right"
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default MyDogsScreen;
