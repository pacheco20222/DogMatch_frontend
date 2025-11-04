import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { Platform } from 'react-native';

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
  const labelPosition = useSharedValue(value ? -18 : 0);
  const labelScale = useSharedValue(value ? 0.85 : 1);

  const handleFocus = () => {
    setIsFocused(true);
    labelPosition.value = withTiming(-18, { duration: 200 });
    labelScale.value = withTiming(0.85, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      labelPosition.value = withTiming(0, { duration: 200 });
      labelScale.value = withTiming(1, { duration: 200 });
    }
  };

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: labelPosition.value },
      { scale: labelScale.value },
    ],
  }));

  const borderColor = error 
    ? 'border-error-500' 
    : isFocused 
      ? (isDark ? 'border-primary-400' : 'border-primary-500')
      : (isDark ? 'border-white/20' : 'border-gray-300');

  return (
    <View className={`w-full ${className}`}>
      <View className="relative">
        <View className={`rounded-2xl overflow-hidden`}>
          <BlurView
            intensity={20}
            tint={isDark ? 'dark' : 'light'}
            className="w-full h-full absolute"
          />
          <View className={`
            ${isDark ? 'bg-white/10' : 'bg-white/70'}
            border-2 ${borderColor}
            rounded-2xl
            px-4
            ${props.multiline ? 'py-3' : 'py-4'}
            flex-row items-center
            min-h-[56px]
          `}>
            {LeftIcon && (
              // If the label is floated (input has value or is focused) the
              // TextInput content is pushed down (we add mt-4). Mirror that
              // offset for the icon so both glyph and input text share the
              // same visual baseline.
              (() => {
                // Use platform-tuned negative offsets to lift the icon so it
                // visually aligns with the numeric/text baseline on iPhones.
                // Increase the upward nudge here after user's feedback.
                const floatedOffset = Platform.OS === 'ios' ? -8 : -6;
                const iconOffset = (isFocused || value) ? floatedOffset : -2;
                return (
                  <View style={{ marginRight: 12, alignSelf: 'center', transform: [{ translateY: iconOffset }] }}>
                    <LeftIcon 
                      size={20} 
                      className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    />
                  </View>
                );
              })()
            )}
            
            <View className="flex-1 relative pt-1">
              {label && (
                <Animated.View 
                  style={[
                    animatedLabelStyle,
                    { 
                      position: 'absolute', 
                      left: 0, 
                      top: isFocused || value ? 0 : 12, 
                      zIndex: 1 
                    }
                  ]}
                  pointerEvents="none"
                >
                  <Text className={`
                    ${isFocused || value 
                      ? (isDark ? 'text-primary-400' : 'text-primary-600')
                      : (isDark ? 'text-gray-400' : 'text-gray-500')
                    }
                    ${isFocused || value ? 'text-xs' : 'text-base'}
                    font-semibold
                  `}>
                    {label}
                  </Text>
                </Animated.View>
              )}
              
              <TextInput
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`
                  ${isDark ? 'text-white' : 'text-gray-900'}
                  text-base
                  ${label && (value || isFocused) ? 'mt-4' : 'mt-0'}
                `}
                placeholder={(isFocused || value) ? placeholder : ''}
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                {...props}
              />
            </View>

            {RightIcon && (
              (() => {
                const floatedOffsetR = Platform.OS === 'ios' ? -8 : -6;
                const iconOffset = (isFocused || value) ? floatedOffsetR : -2;
                return (
                  <TouchableOpacity onPress={onRightIconPress} style={{ marginLeft: 12, alignSelf: 'center', transform: [{ translateY: iconOffset }] }}>
                    <RightIcon 
                      size={20} 
                      className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    />
                  </TouchableOpacity>
                );
              })()
            )}
          </View>
        </View>
      </View>
      
      {error && (
        <Text className="text-error-500 text-sm mt-2 ml-2">
          {error}
        </Text>
      )}
    </View>
  );
};

export default GlassInput;
