import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  ScrollView, 
  Image, 
  Alert,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
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
import { fetchMyDogs, clearError } from '../store/slices/dogsSlice';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard, FloatingActionButton, GlassButton, GradientText } from '../components/glass';

const MyDogsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { isDark } = useTheme();
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
          <View className={`w-20 h-20 rounded-2xl overflow-hidden mr-4 ${
            isDark ? 'bg-primary-500/20' : 'bg-primary-100'
          }`}>
            {dog.primary_photo_url ? (
              <Image
                source={{ 
                  uri: dog.primary_photo_url.startsWith('http') 
                    ? dog.primary_photo_url 
                    : `https://dogmatch-backend.onrender.com${dog.primary_photo_url}`
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Dog size={32} className={isDark ? 'text-primary-400' : 'text-primary-600'} />
              </View>
            )}
          </View>

          {/* Dog Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex-1`}>
                {dog.name}
              </Text>
              <View className={`px-2 py-1 rounded-full ${
                isDark ? 'bg-accent-500/20' : 'bg-accent-100'
              }`}>
                <Text className="text-accent-500 text-xs font-semibold">
                  {dog.age_string || `${dog.age}y`}
                </Text>
              </View>
            </View>
            
            <Text className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {dog.breed}
            </Text>
            
            {/* Size and Gender Pills */}
            <View className="flex-row space-x-2">
              <View 
                key="size-pill"
                className={`px-2 py-1 rounded-lg flex-row items-center ${
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                <Ruler size={12} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <Text className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dog.size}
                </Text>
              </View>
              <View 
                key="gender-pill"
                className={`px-2 py-1 rounded-lg flex-row items-center ${
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                <UserIcon size={12} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <Text className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dog.gender}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {dog.description && (
          <View className="mb-4">
            <Text className={`text-sm leading-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {dog.description}
            </Text>
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
            <View className={`py-2.5 px-4 rounded-xl flex-row items-center justify-center ${
              isDark ? 'bg-primary-500/20' : 'bg-primary-100 border border-primary-200'
            }`}>
              <Edit size={16} className="text-primary-500 mr-2" />
              <Text className="text-primary-500 font-semibold text-sm">Edit</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            key="delete-button"
            onPress={() => handleDeleteDog(dog.id, dog.name)}
            activeOpacity={0.7}
            className="flex-1"
          >
            <View className={`py-2.5 px-4 rounded-xl flex-row items-center justify-center ${
              isDark ? 'bg-error-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <Trash2 size={16} className="text-error-500 mr-2" />
              <Text className="text-error-500 font-semibold text-sm">Delete</Text>
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
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className={`text-base mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your dogs...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  // Empty State
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn.duration(600)} className="items-center justify-center px-6 py-12">
      <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
        isDark ? 'bg-primary-500/20' : 'bg-primary-100'
      }`}>
        <Dog size={48} className="text-primary-500" />
      </View>
      <Text className={`text-2xl font-bold mb-3 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
        No dogs added yet
      </Text>
      <Text className={`text-base text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Add your first dog to start connecting with other dog owners!
      </Text>
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
