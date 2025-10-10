import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../styles/DesignSystem';

const LoadingSpinner = ({
  size = 'medium',
  color = Colors.primary[500],
  text,
  style,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'medium':
        return Typography.fontSize.base;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.base;
    }
  };

  const spinnerSize = getSpinnerSize();
  const textSize = getTextSize();

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: color,
            borderTopColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
      {text && (
        <Text style={[styles.text, { fontSize: textSize, color }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
    marginBottom: Spacing.sm,
  },
  
  text: {
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
