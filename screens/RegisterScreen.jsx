import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Card, Surface, HelperText, Snackbar, SegmentedButtons } from 'react-native-paper';
import { Formik } from 'formik';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { registerSchema } from '../validation/authSchemas';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const RegisterScreen = ({ navigation }) => {
  const { register, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    formOpacity.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const handleRegister = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register(values);
      // Navigation will be handled automatically by AuthNavigator
    } catch (error) {
      console.error('Registration error:', error);
      setFieldError('general', error.message || 'Registration failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]} entering={FadeIn.duration(600)}>
            <Image
              source={require('../assets/icons/paw.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="displayMedium" style={styles.title}>
              Join DogMatch!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Create your account and start matching with amazing dogs
            </Text>
          </Animated.View>

          {/* Registration Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={SlideInUp.duration(600)}>
            <Card mode="elevated" style={styles.formCard}>
              <Card.Content style={styles.formContent}>
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                    confirmPassword: '',
                    username: '',
                    full_name: '',
                    phone: '',
                    location: '',
                    user_type: 'owner',
                  }}
                  validationSchema={registerSchema}
                  onSubmit={handleRegister}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
                    <>
                      <TextInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.email && !!errors.email}
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                      />
                      <HelperText type="error" visible={touched.email && !!errors.email}>
                        {errors.email}
                      </HelperText>

                      <TextInput
                        label="Username"
                        value={values.username}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        mode="outlined"
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.username && !!errors.username}
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                      />
                      <HelperText type="error" visible={touched.username && !!errors.username}>
                        {errors.username}
                      </HelperText>

                      <TextInput
                        label="Full Name"
                        value={values.full_name}
                        onChangeText={handleChange('full_name')}
                        onBlur={handleBlur('full_name')}
                        mode="outlined"
                        autoCapitalize="words"
                        error={touched.full_name && !!errors.full_name}
                        style={styles.input}
                        left={<TextInput.Icon icon="account-circle" />}
                      />
                      <HelperText type="error" visible={touched.full_name && !!errors.full_name}>
                        {errors.full_name}
                      </HelperText>

                      <TextInput
                        label="Phone Number (Optional)"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        mode="outlined"
                        keyboardType="phone-pad"
                        error={touched.phone && !!errors.phone}
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                      />
                      <HelperText type="error" visible={touched.phone && !!errors.phone}>
                        {errors.phone}
                      </HelperText>

                      <TextInput
                        label="Location"
                        value={values.location}
                        onChangeText={handleChange('location')}
                        onBlur={handleBlur('location')}
                        mode="outlined"
                        autoCapitalize="words"
                        error={touched.location && !!errors.location}
                        style={styles.input}
                        left={<TextInput.Icon icon="map-marker" />}
                      />
                      <HelperText type="error" visible={touched.location && !!errors.location}>
                        {errors.location}
                      </HelperText>

                      <Text variant="labelLarge" style={styles.sectionLabel}>
                        Account Type
                      </Text>
                      <SegmentedButtons
                        value={values.user_type}
                        onValueChange={(value) => setFieldValue('user_type', value)}
                        buttons={[
                          { value: 'owner', label: 'Dog Owner' },
                          { value: 'shelter', label: 'Shelter' },
                        ]}
                        style={styles.segmentedButtons}
                      />

                      <TextInput
                        label="Password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        error={touched.password && !!errors.password}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                        right={
                          <TextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        }
                      />
                      <HelperText type="error" visible={touched.password && !!errors.password}>
                        {errors.password}
                      </HelperText>

                      <TextInput
                        label="Confirm Password"
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        mode="outlined"
                        secureTextEntry={!showConfirmPassword}
                        error={touched.confirmPassword && !!errors.confirmPassword}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-check" />}
                        right={
                          <TextInput.Icon
                            icon={showConfirmPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        }
                      />
                      <HelperText type="error" visible={touched.confirmPassword && !!errors.confirmPassword}>
                        {errors.confirmPassword}
                      </HelperText>

                      <HelperText type="error" visible={!!errors.general}>
                        {errors.general}
                      </HelperText>

                      <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isSubmitting || loading}
                        disabled={isSubmitting || loading}
                        style={styles.registerButton}
                        contentStyle={styles.buttonContent}
                      >
                        {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </>
                  )}
                </Formik>
              </Card.Content>
            </Card>

            {/* Navigation Links */}
            <View style={styles.navigationContainer}>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.navigationButton}
              >
                Already have an account? Sign In
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error || 'An error occurred'}
      </Snackbar>
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
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  formContent: {
    padding: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: Spacing.lg,
  },
  registerButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  buttonContent: {
    paddingVertical: Spacing.sm,
  },
  navigationContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navigationButton: {
    minWidth: 200,
  },
});

export default RegisterScreen;