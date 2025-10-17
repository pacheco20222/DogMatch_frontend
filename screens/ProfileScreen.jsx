import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Surface,
  Button,
  Avatar,
  Chip,
  IconButton,
  ActivityIndicator,
  Snackbar,
  Portal,
  Divider,
  List,
} from 'react-native-paper';
import { Formik } from 'formik';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { uploadProfilePhoto, clearError } from '../store/slices/userSlice';
import { useAuth } from '../hooks/useAuth';
import { updateProfileSchema } from '../validation/profileSchemas';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { loading, error, uploadProgress } = useAppSelector(state => state.user);
  const insets = useSafeAreaInsets();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

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
    Alert.alert('Coming Soon', 'Edit Profile screen coming soon!');
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
      console.error('Error picking image:', error);
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
      console.error('Error uploading photo:', error);
      setSnackbarVisible(true);
    }
  };

  const handleMyMatches = () => {
    navigation.navigate('Matches');
  };

  const handleSettings = () => {
    Alert.alert('Coming Soon', 'Settings screen coming soon!');
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
      'owner': Colors.primary[500],
      'admin': Colors.warning[500],
      'shelter': Colors.success[500]
    };
    return colorMap[userType] || Colors.primary[500];
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.title}>
                Profile
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Manage your account
              </Text>
            </View>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => setEditingProfile(!editingProfile)}
              style={styles.editButton}
            />
          </View>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <Card style={styles.profileCard} mode="elevated">
            <Card.Content>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {user?.profile_photo_url ? (
                    <Avatar.Image
                      size={80}
                      source={{ 
                        uri: user.profile_photo_url.startsWith('http') 
                          ? user.profile_photo_url 
                          : `https://dogmatch-backend.onrender.com${user.profile_photo_url}`
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Avatar.Icon 
                      size={80} 
                      icon="account" 
                      style={styles.avatarPlaceholder}
                    />
                  )}
                  
                  <IconButton
                    icon="camera"
                    size={20}
                    style={styles.changePhotoButton}
                    onPress={handleChangePhoto}
                    disabled={loading}
                  />
                </View>
                
                <View style={styles.userInfo}>
                  <Text variant="headlineSmall" style={styles.userName}>
                    {user?.first_name} {user?.last_name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.userEmail}>
                    {user?.email}
                  </Text>
                  <Chip 
                    mode="flat" 
                    style={[styles.userTypeChip, { backgroundColor: getUserTypeColor(user?.user_type) }]}
                    textStyle={styles.userTypeText}
                  >
                    {getUserTypeDisplay(user?.user_type)}
                  </Chip>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.profileDetails}>
                <List.Item
                  title="Username"
                  description={user?.username}
                  left={props => <List.Icon {...props} icon="account" />}
                />
                
                {user?.phone && (
                  <List.Item
                    title="Phone"
                    description={user.phone}
                    left={props => <List.Icon {...props} icon="phone" />}
                  />
                )}
                
                {user?.city && user?.state && (
                  <List.Item
                    title="Location"
                    description={`${user.city}, ${user.state}`}
                    left={props => <List.Icon {...props} icon="map-marker" />}
                  />
                )}
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(400).duration(600)}>
          <Card style={styles.actionsCard} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Quick Actions
              </Text>
              
              <Button
                mode="outlined"
                onPress={handleEditProfile}
                style={styles.actionButton}
                icon="pencil"
              >
                Edit Profile
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleMyMatches}
                style={styles.actionButton}
                icon="heart"
              >
                My Matches
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleSettings}
                style={styles.actionButton}
                icon="cog"
              >
                Settings
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Account Management */}
        <Animated.View style={[styles.accountContainer, cardsAnimatedStyle]} entering={FadeIn.delay(600).duration(600)}>
          <Card style={styles.accountCard} mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Account Management
              </Text>
              
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={[styles.actionButton, styles.logoutButton]}
                textColor={Colors.error[600]}
                icon="logout"
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* App Info */}
        <Animated.View style={[styles.infoContainer, cardsAnimatedStyle]} entering={FadeIn.delay(800).duration(600)}>
          <Card style={styles.infoCard} mode="flat">
            <Card.Content>
              <View style={styles.appInfo}>
                <Text variant="headlineSmall" style={styles.appName}>
                  DogMatch
                </Text>
                <Text variant="bodySmall" style={styles.appVersion}>
                  Version 1.0.0
                </Text>
                <Text variant="bodyMedium" style={styles.appDescription}>
                  Connect with other dog owners and find the perfect match for your furry friend.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Snackbar for errors */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || 'Something went wrong'}
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
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    color: Colors.text.primary,
    marginBottom: -Spacing.xs,
  },
  
  subtitle: {
    color: Colors.text.secondary,
  },
  
  editButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  profileCard: {
    marginBottom: Spacing.lg,
  },
  
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  avatarContainer: {
    marginRight: Spacing.lg,
    position: 'relative',
  },
  
  avatar: {
    backgroundColor: Colors.neutral[200],
  },
  
  avatarPlaceholder: {
    backgroundColor: Colors.neutral[200],
  },
  
  changePhotoButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary[500],
    borderWidth: 2,
    borderColor: Colors.background.primary,
    ...Shadows.sm,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  userEmail: {
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  
  userTypeChip: {
    alignSelf: 'flex-start',
  },
  
  userTypeText: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  divider: {
    marginVertical: Spacing.lg,
  },
  
  profileDetails: {
    // List.Item handles its own styling
  },
  
  actionsContainer: {
    marginBottom: Spacing.lg,
  },
  
  actionsCard: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  actionButton: {
    marginBottom: Spacing.md,
  },
  
  accountContainer: {
    marginBottom: Spacing.lg,
  },
  
  accountCard: {
    marginBottom: Spacing.lg,
  },
  
  logoutButton: {
    borderColor: Colors.error[300],
  },
  
  infoContainer: {
    marginBottom: Spacing.xl,
  },
  
  infoCard: {
    marginBottom: Spacing.lg,
  },
  
  appInfo: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  appName: {
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
  },
  
  appVersion: {
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  
  appDescription: {
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export default ProfileScreen;
