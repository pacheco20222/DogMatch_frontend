import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeContext';
import { getDesignTokens } from '../../styles/designTokens';

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
  const tokens = getDesignTokens(isDark);
  const blurIntensity = intensity || (isDark ? 25 : 20);
  const styles = React.useMemo(() => createStyles(tokens), [isDark]);

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

function createStyles(tokens) {
  return StyleSheet.create({
    container: {
      borderRadius: tokens.borderRadius,
      overflow: 'hidden',
    },
    blurView: {
      width: '100%',
      minHeight: 50,
    },
    innerContainer: {
      borderRadius: tokens.borderRadius,
      width: '100%',
      // default internal padding so content (especially headings) doesn't
      // collide with the rounded corners or get visually clipped. Individual
      // usages can still pass additional padding via className/style.
      padding: tokens.spacingLarge,
    },
    darkContainer: {
      backgroundColor: 'rgba(30, 41, 59, 0.3)',
      borderWidth: 0,
      borderColor: 'transparent',
    },
    lightContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
  });
}

export default GlassCard;
