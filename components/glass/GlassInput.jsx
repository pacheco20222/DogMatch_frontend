import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeContext';

/**
 * GlassInput - Modern glass morphism input with floating label
 * Props:
 * - label: input label
 * - value: input value
 * - onChangeText: change handler
 * - error: error message
 * - icon: left icon component (from lucide-react-native)
 * - rightIcon: right icon component
 * - onRightIconPress: right icon press handler
 * - ...TextInput props
 */
const GlassInput = ({ 
  label,
  value,
  onChangeText,
  error,
  icon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  className = '',
  placeholder,
  ...props 
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Import design tokens for proper theming
  const { getDesignTokens } = require('../../styles/designTokens');
  const tokens = getDesignTokens(isDark);

  const borderColor = error 
    ? 'border-error-500' 
    : isFocused 
      ? (isDark ? 'border-primary-400' : 'border-primary-500')
      : (isDark ? 'border-white/20' : 'border-gray-300');

  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Text
          className={`mb-2 ml-1 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {label}
        </Text>
      )}
      <View className="relative rounded-2xl overflow-hidden">
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          className="w-full h-full absolute"
        />
        <View
          style={{
            backgroundColor: tokens.inputBackground,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: error ? tokens.danger : isFocused ? tokens.primary : tokens.inputBorder,
            paddingHorizontal: 16,
            paddingVertical: 0,
            flexDirection: 'row',
            height: 56,
          }}
        >
            {LeftIcon && (
              <View style={{ marginRight: 12, justifyContent: 'center' }}>
                <LeftIcon
                  size={20}
                  color={tokens.textSecondary}
                />
              </View>
            )}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch', overflow: 'hidden' }}>
              {Platform.OS === 'ios' ? (
                // iOS-specific: TextInput doesn't support textAlignVertical
                // Manually center using padding to align text with icon center
                // These values have been fine-tuned for proper vertical alignment
                <TextInput
                  {...props}
                  value={value}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={[
                    props.style,
                    {
                      fontSize: 16,
                      color: tokens.inputText,
                      height: 56, // Match container height
                      lineHeight: RightIcon ? 25 : 25, // Slightly larger for better visual centering
                      paddingTop: RightIcon ? 20 : 12, // Fine-tuned padding to center text with icons
                      paddingBottom: RightIcon ? 6 : 10, // Asymmetric to account for text baseline
                      paddingHorizontal: 0,
                      letterSpacing: -0.2, // Slight negative spacing for better appearance
                      margin: 0,
                      // Note: textAlignVertical doesn't work on iOS, but padding handles centering
                    },
                  ]}
                  placeholderTextColor={tokens.placeholder}
                />
              ) : (
                // Android: Use textAlignVertical which works properly
                <TextInput
                  {...props}
                  value={value}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={[
                    props.style,
                    {
                      fontSize: 16,
                      lineHeight: 20,
                      color: tokens.inputText,
                      padding: 0,
                      margin: 0,
                      paddingTop: 0,
                      paddingBottom: 0,
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    },
                  ]}
                  placeholderTextColor={tokens.placeholder}
                />
              )}
            </View>

            {RightIcon && (
              <TouchableOpacity
                onPress={onRightIconPress}
                style={{ marginLeft: 12, padding: 4, justifyContent: 'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <RightIcon
                  size={20}
                  color={tokens.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      {/* keep wrapper open for error message */}
      {error && (
        <Text className="text-error-500 text-sm mt-2 ml-2">
          {error}
        </Text>
      )}
    </View>
  );
};

export default GlassInput;
