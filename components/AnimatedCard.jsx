import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows } from '../styles/DesignSystem';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedCard = ({
  children,
  onPress,
  variant = 'default',
  style,
  disabled = false,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      runOnJS(onPress)();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'default':
        baseStyle.push(styles.defaultCard);
        break;
      case 'elevated':
        baseStyle.push(styles.elevatedCard);
        break;
      case 'outlined':
        baseStyle.push(styles.outlinedCard);
        break;
      case 'flat':
        baseStyle.push(styles.flatCard);
        break;
      default:
        baseStyle.push(styles.defaultCard);
    }

    if (disabled) {
      baseStyle.push(styles.disabledCard);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  if (onPress) {
    return (
      <AnimatedTouchableOpacity
        style={[getCardStyle(), animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <Animated.View style={[getCardStyle(), animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  
  defaultCard: {
    backgroundColor: Colors.background.primary,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  
  elevatedCard: {
    backgroundColor: Colors.background.primary,
    ...Shadows.lg,
  },
  
  outlinedCard: {
    backgroundColor: Colors.background.primary,
    borderWidth: 2,
    borderColor: Colors.primary[200],
  },
  
  flatCard: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  
  disabledCard: {
    opacity: 0.6,
  },
});

export default AnimatedCard;
