import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  StyleSheet,
  Alert
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
import AnimatedButton from '../components/AnimatedButton';
import AnimatedCard from '../components/AnimatedCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header and cards
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    cardsOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

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
      {/* Modern Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <AnimatedCard variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {user?.profile_photo_url ? (
                  <Image
                    source={{ 
                      uri: user.profile_photo_url.startsWith('http') 
                        ? user.profile_photo_url 
                        : `https://dogmatch-backend.onrender.com${user.profile_photo_url}`
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(user?.user_type) }]}>
                  <Text style={styles.userTypeText}>
                    {getUserTypeDisplay(user?.user_type)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Username</Text>
                <Text style={styles.detailValue}>{user?.username}</Text>
              </View>
              
              {user?.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{user.phone}</Text>
                </View>
              )}
              
              {user?.city && user?.state && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{user.city}, {user.state}</Text>
                </View>
              )}
            </View>
          </AnimatedCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsContainer, cardsAnimatedStyle]} entering={FadeIn.delay(400).duration(600)}>
          <AnimatedCard variant="outlined" style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <AnimatedButton
              title="Edit Profile"
              onPress={handleEditProfile}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
            
            <AnimatedButton
              title="My Matches"
              onPress={handleMyMatches}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
            
            <AnimatedButton
              title="Settings"
              onPress={handleSettings}
              variant="outline"
              size="large"
              style={styles.actionButton}
            />
          </AnimatedCard>
        </Animated.View>

        {/* Account Management */}
        <Animated.View style={[styles.accountContainer, cardsAnimatedStyle]} entering={FadeIn.delay(600).duration(600)}>
          <AnimatedCard variant="outlined" style={styles.accountCard}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            
            <AnimatedButton
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              size="large"
              style={[styles.actionButton, styles.logoutButton]}
              textStyle={styles.logoutButtonText}
            />
          </AnimatedCard>
        </Animated.View>

        {/* App Info */}
        <Animated.View style={[styles.infoContainer, cardsAnimatedStyle]} entering={FadeIn.delay(800).duration(600)}>
          <AnimatedCard variant="flat" style={styles.infoCard}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>DogMatch</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Connect with other dog owners and find the perfect match for your furry friend.
              </Text>
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
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: -Spacing.xs,
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
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarEmoji: {
    fontSize: Typography.fontSize['2xl'],
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  userEmail: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  
  userTypeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  
  userTypeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: Spacing.lg,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  
  detailValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  
  actionsContainer: {
    marginBottom: Spacing.lg,
  },
  
  actionsCard: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
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
  
  logoutButtonText: {
    color: Colors.error[600],
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
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
  },
  
  appVersion: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  
  appDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export default ProfileScreen;
