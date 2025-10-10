import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
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
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../styles/DesignSystem';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  
  const labelScale = useSharedValue(value ? 0.8 : 1);
  const labelTranslateY = useSharedValue(value ? -8 : 0);
  const borderColor = useSharedValue(Colors.neutral[300]);
  const scale = useSharedValue(1);

  const handleFocus = () => {
    setIsFocused(true);
    labelScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
    labelTranslateY.value = withSpring(-8, { damping: 15, stiffness: 300 });
    borderColor.value = withTiming(Colors.primary[500], { duration: 200 });
    scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      labelScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
    borderColor.value = withTiming(error ? Colors.error[500] : Colors.neutral[300], { duration: 200 });
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleChangeText = (text) => {
    if (onChangeText) {
      onChangeText(text);
    }
    
    if (text && !value) {
      labelScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
      labelTranslateY.value = withSpring(-8, { damping: 15, stiffness: 300 });
    } else if (!text && value) {
      labelScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: labelScale.value },
      { translateY: labelTranslateY.value },
    ],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: borderColor.value,
  }));

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledInput);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
        <Animated.Text style={[styles.label, animatedLabelStyle]}>
          {label}
        </Animated.Text>
        
        <AnimatedTextInput
          ref={inputRef}
          style={getInputStyle()}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={Colors.neutral[400]}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.eyeText}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  
  inputContainer: {
    position: 'relative',
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.primary,
    ...Shadows.sm,
  },
  
  label: {
    position: 'absolute',
    left: Spacing.lg,
    top: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xs,
    zIndex: 1,
  },
  
  input: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 56,
  },
  
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  disabledInput: {
    backgroundColor: Colors.neutral[100],
    color: Colors.text.tertiary,
  },
  
  eyeButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: Spacing.md,
    padding: Spacing.xs,
  },
  
  eyeText: {
    fontSize: Typography.fontSize.lg,
  },
  
  errorContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[500],
  },
});

export default AnimatedInput;
