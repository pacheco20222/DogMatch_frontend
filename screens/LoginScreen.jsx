import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react-native';
import { Formik } from 'formik';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../validation/authSchemas';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import { GlassCard, GlassInput, GlassButton, GradientText } from '../components/glass';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const heartBeat = useSharedValue(1);
  const logoRotate = useSharedValue(0);

  React.useEffect(() => {
    // Heart beat animation
    heartBeat.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      false
    );

    // Logo rotation
    logoRotate.value = withDelay(
      200,
      withSpring(360, { damping: 20, stiffness: 80 })
    );
  }, []);

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      await login({ email: values.email, password: values.password });
      // Navigation handled by AuthNavigator
    } catch (error) {
      logger.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Unable to sign in. Please check your credentials.');
      setFieldError('general', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartBeat.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotate.value}deg` }],
  }));

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark 
          ? ['#312E81', '#1E293B', '#0F172A'] 
          : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
        }
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo & Title */}
            <Animated.View 
              entering={FadeIn.duration(600)}
              className="items-center mb-12"
            >
              <Animated.View style={[heartAnimatedStyle, logoAnimatedStyle]} className="mb-6">
                <View className="w-24 h-24 rounded-full bg-primary-500/20 items-center justify-center">
                  <Heart size={48} className="text-primary-500" fill="#6366F1" />
                </View>
              </Animated.View>
              
              <GradientText
                colors={['#6366F1', '#EC4899', '#14B8A6']}
                className="text-4xl font-bold mb-2"
              >
                Welcome Back!
              </GradientText>
              
              <Text className={`text-base text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to continue your dog matching journey
              </Text>
            </Animated.View>

            {/* Login Form */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <GlassCard className="mb-6">
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                  }}
                  validationSchema={loginSchema}
                  onSubmit={handleLogin}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View>
                      <GlassInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.email && errors.email}
                        icon={Mail}
                        className="mb-4"
                      />

                      <GlassInput
                        label="Password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        secureTextEntry={!showPassword}
                        error={touched.password && errors.password}
                        icon={Lock}
                        rightIcon={showPassword ? EyeOff : Eye}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                        className="mb-6"
                      />

                      {errors.general && (
                        <Text className="text-error-500 text-sm mb-4 text-center">
                          {errors.general}
                        </Text>
                      )}

                      <GlassButton
                        variant="primary"
                        size="lg"
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </GlassButton>
                    </View>
                  )}
                </Formik>
              </GlassCard>

              {/* Navigation Links */}
              <View className="items-center space-y-3">
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                    Don't have an account? <Text className="font-semibold">Sign Up</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => Alert.alert('Forgot Password', 'Password reset feature coming soon!')}
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;