import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import GlassCard from '../glass/GlassCard';

const StatCard = React.memo(({ 
  title, 
  value, 
  icon: IconComponent, 
  color = 'primary',
  onPress,
  style 
}) => {
  const { isDark } = useTheme();
  
  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'bg-primary-500';
      case 'secondary': return 'bg-secondary-500';
      case 'success': return 'bg-success-500';
      case 'warning': return 'bg-warning-500';
      case 'error': return 'bg-error-500';
      default: return 'bg-primary-500';
    }
  };

  const getTextColorClass = () => {
    switch (color) {
      case 'primary': return 'text-primary-500';
      case 'secondary': return 'text-secondary-500';
      case 'success': return 'text-success-500';
      case 'warning': return 'text-warning-500';
      case 'error': return 'text-error-500';
      default: return 'text-primary-500';
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={style} className="flex-1 m-1">
  <GlassCard className="items-center justify-center min-h-30">
        <View className={`w-12 h-12 rounded-2xl ${getColorClass()} items-center justify-center mb-2`}>
          {IconComponent && <IconComponent size={24} color="#fff" />}
        </View>
        <Text className={`text-3xl font-bold mb-1 ${getTextColorClass()}`}>
          {value}
        </Text>
        <Text className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {title}
        </Text>
      </GlassCard>
    </Wrapper>
  );
});

StatCard.displayName = 'StatCard';


export default StatCard;
