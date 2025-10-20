import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeContext';

/**
 * GlassCard - A frosted glass effect card component
 * Props:
 * - intensity: blur intensity (default: 20)
 * - className: additional Tailwind classes
 * - children: card content
 */
const GlassCard = ({ 
  intensity, 
  className = '', 
  children,
  style,
  ...props 
}) => {
  const { isDark } = useTheme();
  const blurIntensity = intensity || (isDark ? 25 : 20);

  return (
    <View 
      className={`rounded-3xl overflow-hidden ${className}`} 
      style={[styles.container, style]}
      {...props}
    >
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurView}
      >
        <View style={[
          styles.innerContainer,
          isDark ? styles.darkContainer : styles.lightContainer
        ]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurView: {
    width: '100%',
    minHeight: 50,
  },
  innerContainer: {
    borderRadius: 24,
    width: '100%',
  },
  darkContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)', // Even lower opacity for seamless blend
    borderWidth: 0, // No border for seamless look
    borderColor: 'transparent',
  },
  lightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default GlassCard;
