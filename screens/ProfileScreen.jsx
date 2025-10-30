import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Image,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Edit3,
  Heart,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Home as HomeIcon
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { uploadProfilePhoto, clearError } from '../store/slices/userSlice';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import { GlassCard, GlassButton } from '../components/glass';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { loading, error, uploadProgress } = useAppSelector(state => state.user);
  const insets = useSafeAreaInsets();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const { isDark } = useTheme();

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // AuthNavigator will automatically switch to MainScreen
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to the Edit Profile screen registered in the Profile stack
    navigation.navigate('EditProfile');
  };

  const handleChangePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfilePhoto = async (imageAsset) => {
    try {
      await dispatch(uploadProfilePhoto({
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile_photo.jpg',
      })).unwrap();
      
      Alert.alert('Success!', 'Profile photo updated successfully!');
    } catch (error) {
      logger.error('Error uploading photo:', error);
      setSnackbarVisible(true);
    }
  };

  const handleMyMatches = () => {
    navigation.navigate('Matches');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const getUserTypeDisplay = (userType) => {
    const typeMap = {
      'owner': 'Dog Owner',
      'admin': 'Administrator',
      'shelter': 'Shelter'
    };
    return typeMap[userType] || userType;
  };

  const getUserTypeColor = (userType) => {
    const colorMap = {
      'owner': '#6366F1',
      'admin': '#F59E0B',
      'shelter': '#10B981'
    };
    return colorMap[userType] || '#6366F1';
  };

  const getUserTypeIcon = (userType) => {
    const iconMap = {
      'owner': User,
      'admin': Shield,
      'shelter': HomeIcon
    };
    return iconMap[userType] || User;
  };

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
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="px-6 py-6"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Profile
                </Text>
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Manage your account
                </Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleLogout}
                  className="w-10 h-10 rounded-full items-center justify-center bg-red-500"
                  activeOpacity={0.7}
                >
                  <LogOut size={20} className="text-white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditingProfile(!editingProfile)}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? 'bg-white/10' : 'bg-white/70'
                  }`}
                  activeOpacity={0.7}
                >
                  <Edit3 size={20} className={isDark ? 'text-white' : 'text-gray-900'} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-4 mb-3">
            <GlassCard className="p-5">
              {/* Avatar and Basic Info */}
              <View className="items-center mb-4">
                <View className="relative">
                  {user?.profile_photo_url ? (
                    <Image
                      source={{ 
                        uri: user.profile_photo_url.startsWith('http') 
                          ? user.profile_photo_url 
                          : `https://dogmatch-backend.onrender.com${user.profile_photo_url}`
                      }}
                      className="w-24 h-24 rounded-full"
                    />
                  ) : (
                    <View className={`w-24 h-24 rounded-full items-center justify-center ${
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      <User size={40} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </View>
                  )}
                  
                  {/* Camera Button */}
                  <TouchableOpacity
                    onPress={handleChangePhoto}
                    disabled={loading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 items-center justify-center border-2 border-white"
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Camera size={16} className="text-white" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* User Name */}
                <Text className={`text-2xl font-bold mt-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.first_name} {user?.last_name}
                </Text>

                {/* Email */}
                <Text className={`text-sm mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user?.email}
                </Text>

                {/* User Type Badge */}
                <View 
                  className="flex-row items-center px-4 py-2 rounded-full mt-3"
                  style={{ backgroundColor: getUserTypeColor(user?.user_type) + '20' }}
                >
                  {React.createElement(getUserTypeIcon(user?.user_type), {
                    size: 16,
                    color: getUserTypeColor(user?.user_type)
                  })}
                  <Text 
                    className="text-sm font-semibold ml-2"
                    style={{ color: getUserTypeColor(user?.user_type) }}
                  >
                    {getUserTypeDisplay(user?.user_type)}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px mb-3" style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }} />

              {/* Profile Details */}
              <View>
                {/* Username */}
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <User size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Username
                    </Text>
                    <Text className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.username}
                    </Text>
                  </View>
                </View>

                {/* Phone */}
                {user?.phone && (
                  <View className="flex-row items-center mt-2">
                    <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      <Phone size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Phone
                      </Text>
                      <Text className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.phone}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Location */}
                {user?.city && user?.state && (
                  <View className="flex-row items-center mt-2">
                    <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      <MapPin size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Location
                      </Text>
                      <Text className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.city}, {user.state}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-4 mb-3">
            <GlassCard className="p-5">
              <Text className={`text-lg font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Quick Actions
              </Text>

              {/* Edit Profile Button */}
              <TouchableOpacity
                onPress={handleEditProfile}
                className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                  <Edit3 size={20} className="text-blue-500" />
                </View>
                <Text className={`text-base font-semibold flex-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Edit Profile
                </Text>
              </TouchableOpacity>

              {/* My Matches Button */}
              <TouchableOpacity
                onPress={handleMyMatches}
                className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-full bg-pink-500/20 items-center justify-center mr-3">
                  <Heart size={20} className="text-pink-500" />
                </View>
                <Text className={`text-base font-semibold flex-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  My Matches
                </Text>
              </TouchableOpacity>

              {/* Settings Button */}
              <TouchableOpacity
                onPress={handleSettings}
                className={`flex-row items-center p-3 rounded-2xl ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center mr-3">
                  <SettingsIcon size={20} className="text-gray-500" />
                </View>
                <Text className={`text-base font-semibold flex-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Settings
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* Account Management */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="px-4 mb-3">
            <GlassCard className="p-5">
              <Text className={`text-lg font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Account Management
              </Text>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className={`flex-row items-center p-3 rounded-2xl ${
                  isDark ? 'bg-red-500/10' : 'bg-red-50'
                }`}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
                  <LogOut size={20} className="text-red-500" />
                </View>
                <Text className="text-base font-semibold flex-1 text-red-500">
                  Logout
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* App Info */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} className="px-4 mb-6">
            <GlassCard className="p-4 items-center">
              <Text className="text-2xl font-bold text-primary-500 mb-2">
                DogMatch
              </Text>
              <Text className={`text-xs mb-3 ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Version 1.0.0
              </Text>
              <Text className={`text-sm text-center leading-5 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Connect with other dog owners and find the perfect match for your furry friend.
              </Text>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};


export default ProfileScreen;
