import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle, AlertCircle, Inbox } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { GlassButton } from '../glass';

const EmptyState = React.memo(({ 
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
  style 
}) => {
  const { isDark } = useTheme();

  // Map icon names to Lucide components
  const iconMap = {
    'message-outline': MessageCircle,
    'alert-circle': AlertCircle,
    'inbox': Inbox,
  };

  const IconComponent = iconMap[icon] || Inbox;

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      className="flex-1 justify-center items-center px-8"
      style={style}
    >
      {/* Icon */}
      <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
        isDark ? 'bg-white/5' : 'bg-gray-100'
      }`}>
        <IconComponent 
          size={48} 
          className={isDark ? 'text-gray-400' : 'text-gray-500'}
        />
      </View>

      {/* Title */}
      <Text className={`text-2xl font-bold text-center mb-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </Text>

      {/* Description */}
      <Text className={`text-base text-center mb-8 leading-6 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <GlassButton
          onPress={onAction}
          className="px-8 py-4"
        >
          {actionLabel}
        </GlassButton>
      )}
    </Animated.View>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
