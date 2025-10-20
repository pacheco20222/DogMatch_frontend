import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * FloatingActionButton - Premium FAB with glass morphism
 * Props:
 * - icon: icon component (from lucide-react-native)
 * - onPress: press handler
 * - variant: 'primary' | 'secondary' | 'accent'
 * - size: 'sm' | 'md' | 'lg'
 * - position: 'bottom-right' | 'bottom-left' | 'bottom-center'
 */
const FloatingActionButton = ({ 
  icon: Icon,
  onPress,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    // Add subtle rotation animation on press
    rotate.value = withSequence(
      withSpring(15, { damping: 10 }),
      withSpring(0, { damping: 10 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Size configuration
  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 20 },
    md: { container: 'w-16 h-16', icon: 24 },
    lg: { container: 'w-20 h-20', icon: 28 },
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -ml-8',
  };

  // Variant colors
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return isDark
          ? 'bg-primary-500/90 border-primary-400/50'
          : 'bg-primary-500/95 border-primary-400/60';
      case 'secondary':
        return isDark
          ? 'bg-secondary-500/90 border-secondary-400/50'
          : 'bg-secondary-500/95 border-secondary-400/60';
      case 'accent':
        return isDark
          ? 'bg-accent-500/90 border-accent-400/50'
          : 'bg-accent-500/95 border-accent-400/60';
      default:
        return isDark
          ? 'bg-primary-500/90 border-primary-400/50'
          : 'bg-primary-500/95 border-primary-400/60';
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      activeOpacity={0.9}
      className={`absolute ${positionClasses[position]} ${className}`}
      {...props}
    >
      <View className={`${sizeConfig[size].container} rounded-full overflow-hidden shadow-2xl`}>
        <BlurView
          intensity={15}
          tint={isDark ? 'dark' : 'light'}
          className="w-full h-full absolute"
        />
        <View className={`
          ${getVariantClasses()}
          ${sizeConfig[size].container}
          rounded-full
          border-2
          items-center
          justify-center
        `}>
          {Icon && <Icon size={sizeConfig[size].icon} className="text-white" />}
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export default FloatingActionButton;
