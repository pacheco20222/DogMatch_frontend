import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
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
import AnimatedInput from '../components/AnimatedInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    formOpacity.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]} entering={FadeIn.duration(800)}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🐕</Text>
              <Text style={styles.logoText}>DogMatch</Text>
              <Text style={styles.tagline}>Find your perfect furry friend</Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.formSection, formAnimatedStyle]} entering={SlideInUp.delay(400).duration(600)}>
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.subtitleText}>Sign in to continue your journey</Text>

              {error ? (
                <Animated.View style={styles.errorContainer} entering={FadeIn.duration(300)}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              <AnimatedInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error && !email.trim() ? 'Email is required' : ''}
              />

              <AnimatedInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                error={error && !password.trim() ? 'Password is required' : ''}
              />

              <AnimatedButton
                title={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                size="large"
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <AnimatedButton
                title="Create Account"
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                size="large"
                style={styles.registerButton}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  logoSection: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logoEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  
  logoText: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  
  tagline: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  formSection: {
    flex: 1,
    justifyContent: 'center',
  },
  
  formContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  
  welcomeText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  subtitleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[600],
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  loginButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
  },
  
  dividerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  
  registerButton: {
    marginTop: Spacing.sm,
  },
});

export default LoginScreen;
