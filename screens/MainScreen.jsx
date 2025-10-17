import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import AnimatedButton from '../components/AnimatedButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MainScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate logo with bounce and rotation
    logoScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
    logoRotation.value = withDelay(500, withSpring(360, { damping: 15, stiffness: 50 }));
    
    // Animate text elements
    titleOpacity.value = withDelay(800, withSpring(1, { damping: 15, stiffness: 100 }));
    subtitleOpacity.value = withDelay(1000, withSpring(1, { damping: 15, stiffness: 100 }));
    buttonsOpacity.value = withDelay(1200, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: (1 - subtitleOpacity.value) * 20 }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: (1 - buttonsOpacity.value) * 30 }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, logoAnimatedStyle]} entering={FadeIn.duration(1000)}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🐕</Text>
            <Text style={styles.logoText}>DogMatch</Text>
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={[styles.contentSection, titleAnimatedStyle]} entering={SlideInUp.delay(400).duration(800)}>
          <Text style={styles.title}>Welcome to DogMatch!</Text>
          <Text style={styles.subtitle}>
            Connect with other dog owners and find the perfect playmate for your furry friend.
          </Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View style={[styles.featuresSection, subtitleAnimatedStyle]} entering={SlideInUp.delay(600).duration(800)}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💕</Text>
            <Text style={styles.featureText}>Find perfect matches</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎉</Text>
            <Text style={styles.featureText}>Join community events</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏠</Text>
            <Text style={styles.featureText}>Connect with local owners</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsSection, buttonsAnimatedStyle]} entering={SlideInUp.delay(800).duration(800)}>
          <AnimatedButton
            title="Get Started"
            onPress={() => navigation.navigate('Register')}
            size="large"
            style={styles.primaryButton}
          />
          
          <AnimatedButton
            title="Already have an account? Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            size="large"
            style={styles.secondaryButton}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={styles.footer} entering={FadeIn.delay(1000).duration(600)}>
          <Text style={styles.footerText}>
            Join thousands of dog owners finding their perfect matches
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logoEmoji: {
    fontSize: 120,
    marginBottom: Spacing.lg,
  },
  
  logoText: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    letterSpacing: 2,
  },
  
  contentSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.tight * Typography.fontSize['3xl'],
  },
  
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.lg,
    paddingHorizontal: Spacing.lg,
  },
  
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
  },
  
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  featureIcon: {
    fontSize: Typography.fontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  
  featureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  buttonsSection: {
    width: '100%',
    marginBottom: Spacing['3xl'],
  },
  
  primaryButton: {
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  
  secondaryButton: {
    paddingVertical: Spacing.lg,
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MainScreen;
