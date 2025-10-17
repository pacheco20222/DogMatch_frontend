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
import { Text, TextInput, Button, Card, Surface, HelperText, Snackbar } from 'react-native-paper';
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
import { loginSchema } from '../validation/authSchemas';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const LoginScreen = ({ navigation }) => {
  const { login, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const logoScale = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    formOpacity.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      await login(values);
      // Navigation will be handled automatically by AuthNavigator
    } catch (error) {
      console.error('Login error:', error);
      setFieldError('general', error.message || 'Login failed. Please try again.');
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
              Welcome Back!
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to continue your dog matching journey
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={SlideInUp.duration(600)}>
            <Card mode="elevated" style={styles.formCard}>
              <Card.Content style={styles.formContent}>
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                    twoFactorCode: '',
                  }}
                  validationSchema={loginSchema}
                  onSubmit={handleLogin}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
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
                        label="2FA Code (Optional)"
                        value={values.twoFactorCode}
                        onChangeText={handleChange('twoFactorCode')}
                        onBlur={handleBlur('twoFactorCode')}
                        mode="outlined"
                        keyboardType="numeric"
                        maxLength={6}
                        error={touched.twoFactorCode && !!errors.twoFactorCode}
                        style={styles.input}
                        left={<TextInput.Icon icon="shield-key" />}
                      />
                      <HelperText type="error" visible={touched.twoFactorCode && !!errors.twoFactorCode}>
                        {errors.twoFactorCode}
                      </HelperText>

                      <HelperText type="error" visible={!!errors.general}>
                        {errors.general}
                      </HelperText>

                      <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isSubmitting || loading}
                        disabled={isSubmitting || loading}
                        style={styles.loginButton}
                        contentStyle={styles.buttonContent}
                      >
                        {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
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
                onPress={() => navigation.navigate('Register')}
                style={styles.navigationButton}
              >
                Don't have an account? Sign Up
              </Button>
              
              <Button
                mode="text"
                onPress={() => {
                  // TODO: Implement forgot password
                  console.log('Forgot password pressed');
                }}
                style={styles.navigationButton}
              >
                Forgot Password?
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
    marginBottom: Spacing.xl,
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
  loginButton: {
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

export default LoginScreen;