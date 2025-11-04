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
import { getDesignTokens } from '../styles/designTokens';
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
  const tokens = getDesignTokens(isDark);

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
      'owner': tokens.primary,
      'admin': tokens.warning,
      'shelter': tokens.success
    };
    return colorMap[userType] || tokens.primary;
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
        colors={tokens.gradientBackground}
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
                <Text style={{ color: tokens.textPrimary, fontSize: 28, fontWeight: '700' }}>
                  Profile
                </Text>
                <Text style={{ color: tokens.textSecondary, fontSize: 16, marginTop: 4 }}>
                  Manage your account
                </Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleLogout}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                  style={{ backgroundColor: tokens.actionPassBg }}
                >
                  <LogOut size={20} color={tokens.danger} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditingProfile(!editingProfile)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : tokens.cardBackground }}
                >
                  <Edit3 size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-4 mb-3">
            <GlassCard>
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
                    <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : tokens.cardBackground }}>
                      <User size={40} color={tokens.textSecondary} />
                    </View>
                  )}
                  
                  {/* Camera Button */}
                  <TouchableOpacity
                    onPress={handleChangePhoto}
                    disabled={loading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full items-center justify-center"
                    activeOpacity={0.8}
                    style={{ backgroundColor: tokens.primary, borderWidth: 2, borderColor: tokens.primaryContrast }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={tokens.primaryContrast} />
                    ) : (
                      <Camera size={16} color={tokens.primaryContrast} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* User Name */}
                <Text style={{ color: tokens.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 16 }}>
                  {user?.first_name} {user?.last_name}
                </Text>

                {/* Email */}
                <Text style={{ color: tokens.textSecondary, fontSize: 14, marginTop: 6 }}>
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
              <View className="h-px mb-3" style={{ backgroundColor: tokens.border }} />

              {/* Profile Details */}
              <View>
                {/* Username */}
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                      <User size={20} color={tokens.textSecondary} />
                    </View>
                  <View className="flex-1">
                    <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
                      Username
                    </Text>
                    <Text style={{ color: tokens.textPrimary, fontSize: 14, fontWeight: '600' }}>{user?.username}</Text>
                  </View>
                </View>

                {/* Phone */}
                {user?.phone && (
                  <View className="flex-row items-center mt-2">
                    <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                      <Phone size={20} color={tokens.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
                        Phone
                      </Text>
                      <Text style={{ color: tokens.textPrimary, fontSize: 14, fontWeight: '600' }}>{user.phone}</Text>
                    </View>
                  </View>
                )}

                {/* Location */}
                {user?.city && user?.state && (
                  <View className="flex-row items-center mt-2">
                    <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}>
                      <MapPin size={20} color={tokens.textSecondary} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: tokens.textSecondary, fontSize: 12 }}>
                        Location
                      </Text>
                        <Text style={{ color: tokens.textPrimary, fontSize: 14, fontWeight: '600' }}>{user.city}, {user.state}</Text>
                    </View>
                  </View>
                )}
              </View>
            </GlassCard>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-4 mb-3">
            <GlassCard>
              <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                Quick Actions
              </Text>

              {/* Edit Profile Button */}
              <TouchableOpacity
                onPress={handleEditProfile}
                className="flex-row items-center p-3 rounded-2xl mb-2"
                activeOpacity={0.7}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}>
                  <Edit3 size={20} color={tokens.primary} />
                </View>
                <Text style={{ color: tokens.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 }}>Edit Profile</Text>
              </TouchableOpacity>

              {/* My Matches Button */}
              <TouchableOpacity
                onPress={handleMyMatches}
                className="flex-row items-center p-3 rounded-2xl mb-2"
                activeOpacity={0.7}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.08)' }}>
                  <Heart size={20} color={'#EC4899'} />
                </View>
                <Text style={{ color: tokens.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 }}>My Matches</Text>
              </TouchableOpacity>

              {/* Settings Button */}
              <TouchableOpacity
                onPress={handleSettings}
                className="flex-row items-center p-3 rounded-2xl"
                activeOpacity={0.7}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : tokens.cardBackground }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.06)' }}>
                  <SettingsIcon size={20} color={tokens.textSecondary} />
                </View>
                <Text style={{ color: tokens.textPrimary, fontSize: 16, fontWeight: '600', flex: 1 }}>Settings</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* Account Management */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="px-4 mb-3">
            <GlassCard>
              <Text style={{ color: tokens.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Account Management</Text>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center p-3 rounded-2xl"
                activeOpacity={0.7}
                style={{ backgroundColor: tokens.actionPassBg }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                  <LogOut size={20} color={tokens.danger} />
                </View>
                <Text style={{ color: tokens.danger, fontSize: 16, fontWeight: '600', flex: 1 }}>Logout</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>

          {/* App Info */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} className="px-4 mb-6">
            <GlassCard className="items-center">
              <Text style={{ color: tokens.primary, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>DogMatch</Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 12, marginBottom: 12 }}>Version 1.0.0</Text>
              <Text style={{ color: tokens.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
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
