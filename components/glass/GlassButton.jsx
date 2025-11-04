import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { getDesignTokens } from '../../styles/designTokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GlassButton - Premium glass morphism button with animations
 * Props:
 * - variant: 'primary' | 'secondary' | 'accent' | 'ghost'
 * - size: 'sm' | 'md' | 'lg'
 * - loading: boolean
 * - disabled: boolean
 * - icon: optional icon component (from lucide-react-native)
 * - children: button text
 */
const GlassButton = ({ 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  onPress,
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Variant classes
  const getVariantClasses = () => {
    if (disabled) {
      return isDark 
        ? 'bg-gray-700/50 border border-gray-600/30'
        : 'bg-gray-300/50 border border-gray-400/30';
    }

    switch (variant) {
      case 'primary':
        return isDark
          ? 'bg-primary-500/80 border border-primary-400/40'
          : 'bg-primary-500/90 border border-primary-400/50';
      case 'secondary':
        return isDark
          ? 'bg-secondary-500/80 border border-secondary-400/40'
          : 'bg-secondary-500/90 border border-secondary-400/50';
      case 'accent':
        return isDark
          ? 'bg-accent-500/80 border border-accent-400/40'
          : 'bg-accent-500/90 border border-accent-400/50';
      case 'ghost':
        return isDark
          ? 'bg-white/5 border border-white/10'
          : 'bg-white/70 border border-white/40';
      default:
        return isDark
          ? 'bg-primary-500/80 border border-primary-400/40'
          : 'bg-primary-500/90 border border-primary-400/50';
    }
  };

  const getTextColor = () => {
    if (disabled) return tokens.muted;
    if (variant === 'ghost') return tokens.textPrimary;
    return tokens.primaryContrast;
  };

  const getTextColorToken = getTextColor();

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      activeOpacity={0.9}
      className={className}
      {...props}
    >
      <View className={`rounded-2xl overflow-hidden ${sizeClasses[size]}`}>
        <BlurView
          intensity={variant === 'ghost' ? (isDark ? 30 : 20) : 10}
          tint={isDark ? 'dark' : 'light'}
          className="w-full h-full absolute"
        />
        <View className={`
          ${getVariantClasses()}
          rounded-2xl
          flex-row items-center justify-center
          ${sizeClasses[size]}
        `}>
          {loading ? (
            <ActivityIndicator color={variant === 'ghost' ? getTextColorToken : tokens.primaryContrast} />
          ) : (
            <>
              {Icon && (
                <Icon
                  size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
                  color={getTextColorToken}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={{ color: getTextColorToken }} className={`${textSizeClasses[size]} font-semibold`}>
                {children}
              </Text>
            </>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export default GlassButton;
