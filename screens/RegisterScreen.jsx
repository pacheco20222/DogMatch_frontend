import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedInput from '../components/AnimatedInput';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    country: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    formOpacity.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { email, first_name, last_name, username, password, confirmPassword } = formData;
    
    if (!email.trim() || !first_name.trim() || !last_name.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registrationData } = formData;
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          ...registrationData,
          phone: formData.phone_number,
          user_type: 'owner'
        }
      });

      if (data.user) {
        Alert.alert(
          'Registration Successful!',
          'Your account has been created successfully. Please log in to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        setError(
          data.messages
            ? Object.values(data.messages).flat().join('\n')
            : data.message || 'Registration failed. Please try again.'
        );
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
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
          {/* Header Section */}
          <Animated.View style={[styles.headerSection, logoAnimatedStyle]} entering={FadeIn.duration(800)}>
            <View style={styles.headerContainer}>
              <Text style={styles.logoEmoji}>🐕</Text>
              <Text style={styles.logoText}>Join DogMatch</Text>
              <Text style={styles.tagline}>Start your journey to find the perfect match</Text>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.formSection, formAnimatedStyle]} entering={SlideInUp.delay(400).duration(600)}>
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Create Your Account</Text>
              <Text style={styles.subtitleText}>Fill in your details to get started</Text>

              {error ? (
                <Animated.View style={styles.errorContainer} entering={FadeIn.duration(300)}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Personal Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <AnimatedInput
                      label="First Name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChangeText={(value) => handleInputChange('first_name', value)}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <AnimatedInput
                      label="Last Name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChangeText={(value) => handleInputChange('last_name', value)}
                    />
                  </View>
                </View>

                <AnimatedInput
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                />

                <AnimatedInput
                  label="Email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AnimatedInput
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={formData.phone_number}
                  onChangeText={(value) => handleInputChange('phone_number', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Location Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Location</Text>
                
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <AnimatedInput
                      label="City"
                      placeholder="Enter city"
                      value={formData.city}
                      onChangeText={(value) => handleInputChange('city', value)}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <AnimatedInput
                      label="State"
                      placeholder="Enter state"
                      value={formData.state}
                      onChangeText={(value) => handleInputChange('state', value)}
                    />
                  </View>
                </View>

                <AnimatedInput
                  label="Country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                />
              </View>

              {/* Security */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Security</Text>
                
                <AnimatedInput
                  label="Password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={true}
                />

                <AnimatedInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={true}
                />
              </View>

              <AnimatedButton
                title={loading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                size="large"
                style={styles.registerButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <AnimatedButton
                title="Already have an account? Sign In"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                size="large"
                style={styles.loginButton}
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
  
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  
  headerContainer: {
    alignItems: 'center',
  },
  
  logoEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  
  logoText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  
  formSection: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  
  formContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
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
  
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    flex: 0.48,
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
  
  registerButton: {
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
  
  loginButton: {
    marginTop: Spacing.sm,
  },
});

export default RegisterScreen;
