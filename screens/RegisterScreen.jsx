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
import { Mail, User, Users, Phone, MapPin, Lock, Eye, EyeOff, Heart, Home } from 'lucide-react-native';
import { Formik } from 'formik';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { registerSchema } from '../validation/authSchemas';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import { GlassCard, GlassInput, GlassButton, GradientText } from '../components/glass';

const RegisterScreen = ({ navigation }) => {
  const { register, loading } = useAuth();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('owner');

  const heartBeat = useSharedValue(1);

  React.useEffect(() => {
    heartBeat.value = withRepeat(
      withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      false
    );
  }, []);

  const handleRegister = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register(values);
      // Navigation handled by AuthNavigator
    } catch (error) {
      logger.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Unable to create account. Please try again.');
      setFieldError('general', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartBeat.value }],
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
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo & Title */}
            <Animated.View 
              entering={FadeIn.duration(600)}
              className="items-center mb-8"
            >
              <Animated.View style={heartAnimatedStyle} className="mb-4">
                <View className="w-20 h-20 rounded-full bg-secondary-500/20 items-center justify-center">
                  <Heart size={40} className="text-secondary-500" fill="#EC4899" />
                </View>
              </Animated.View>
              
              <GradientText
                colors={['#6366F1', '#EC4899', '#14B8A6']}
                className="text-3xl font-bold mb-2"
              >
                Join DogMatch!
              </GradientText>
              
              <Text className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Create your account and start matching with amazing dogs
              </Text>
            </Animated.View>

            {/* Registration Form */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)}>
              <GlassCard className="mb-6">
                <Formik
                  initialValues={{
                    email: '',
                    password: '',
                    confirmPassword: '',
                    username: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    city: '',
                    state: '',
                    country: '',
                    user_type: 'owner',
                  }}
                  validationSchema={registerSchema}
                  onSubmit={handleRegister}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
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
                        label="Username"
                        value={values.username}
                        onChangeText={handleChange('username')}
                        onBlur={handleBlur('username')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.username && errors.username}
                        icon={User}
                        className="mb-4"
                      />

                      <GlassInput
                        label="First Name"
                        value={values.first_name}
                        onChangeText={handleChange('first_name')}
                        onBlur={handleBlur('first_name')}
                        autoCapitalize="words"
                        error={touched.first_name && errors.first_name}
                        icon={User}
                        className="mb-4"
                      />

                      <GlassInput
                        label="Last Name"
                        value={values.last_name}
                        onChangeText={handleChange('last_name')}
                        onBlur={handleBlur('last_name')}
                        autoCapitalize="words"
                        error={touched.last_name && errors.last_name}
                        icon={Users}
                        className="mb-4"
                      />

                      <GlassInput
                        label="Phone Number (Optional)"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        keyboardType="phone-pad"
                        error={touched.phone && errors.phone}
                        icon={Phone}
                        className="mb-4"
                      />

                      <GlassInput
                        label="City"
                        value={values.city}
                        onChangeText={handleChange('city')}
                        onBlur={handleBlur('city')}
                        autoCapitalize="words"
                        error={touched.city && errors.city}
                        icon={MapPin}
                        className="mb-4"
                      />

                      <GlassInput
                        label="State"
                        value={values.state}
                        onChangeText={handleChange('state')}
                        onBlur={handleBlur('state')}
                        autoCapitalize="words"
                        error={touched.state && errors.state}
                        icon={MapPin}
                        className="mb-4"
                      />

                      <GlassInput
                        label="Country"
                        value={values.country}
                        onChangeText={handleChange('country')}
                        onBlur={handleBlur('country')}
                        autoCapitalize="words"
                        error={touched.country && errors.country}
                        icon={MapPin}
                        className="mb-4"
                      />

                      {/* Account Type Selector */}
                      <View className="mb-4">
                        <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Account Type
                        </Text>
                        <View className="flex-row space-x-3">
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedUserType('owner');
                              setFieldValue('user_type', 'owner');
                            }}
                            className="flex-1"
                            activeOpacity={0.8}
                          >
                            <View className={`p-4 rounded-2xl border-2 ${
                              values.user_type === 'owner'
                                ? (isDark ? 'bg-primary-500/20 border-primary-500' : 'bg-primary-100 border-primary-500')
                                : (isDark ? 'bg-white/5 border-white/20' : 'bg-gray-100 border-gray-300')
                            }`}>
                              <Home size={24} className={`${
                                values.user_type === 'owner' ? 'text-primary-500' : (isDark ? 'text-gray-400' : 'text-gray-600')
                              } mb-2`} />
                              <Text className={`text-sm font-semibold ${
                                values.user_type === 'owner' 
                                  ? 'text-primary-500' 
                                  : (isDark ? 'text-white' : 'text-gray-900')
                              }`}>
                                Dog Owner
                              </Text>
                            </View>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setSelectedUserType('shelter');
                              setFieldValue('user_type', 'shelter');
                            }}
                            className="flex-1"
                            activeOpacity={0.8}
                          >
                            <View className={`p-4 rounded-2xl border-2 ${
                              values.user_type === 'shelter'
                                ? (isDark ? 'bg-secondary-500/20 border-secondary-500' : 'bg-secondary-100 border-secondary-500')
                                : (isDark ? 'bg-white/5 border-white/20' : 'bg-gray-100 border-gray-300')
                            }`}>
                              <Heart size={24} className={`${
                                values.user_type === 'shelter' ? 'text-secondary-500' : (isDark ? 'text-gray-400' : 'text-gray-600')
                              } mb-2`} />
                              <Text className={`text-sm font-semibold ${
                                values.user_type === 'shelter' 
                                  ? 'text-secondary-500' 
                                  : (isDark ? 'text-white' : 'text-gray-900')
                              }`}>
                                Shelter
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>

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
                        className="mb-4"
                      />

                      <GlassInput
                        label="Confirm Password"
                        value={values.confirmPassword}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        error={touched.confirmPassword && errors.confirmPassword}
                        icon={Lock}
                        rightIcon={showConfirmPassword ? EyeOff : Eye}
                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        loading={isSubmitting || loading}
                        disabled={isSubmitting || loading}
                        className="w-full"
                      >
                        {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
                      </GlassButton>
                    </View>
                  )}
                </Formik>
              </GlassCard>

              {/* Navigation Link */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text className={`text-base ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                    Already have an account? <Text className="font-semibold">Sign In</Text>
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

export default RegisterScreen;
