import React from 'react';
import { Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * GradientText - Text with gradient colors
 * Props:
 * - colors: array of gradient colors
 * - start: gradient start point { x: number, y: number }
 * - end: gradient end point { x: number, y: number }
 * - className: Tailwind classes for text styling
 * - children: text content
 */
const GradientText = ({ 
  colors = ['#6366F1', '#EC4899', '#14B8A6'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  className = '',
  children,
  ...props 
}) => {
  return (
    <MaskedView
      maskElement={
        <Text className={className} {...props}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
      >
        <Text className={`${className} opacity-0`} {...props}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
