import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Calendar, MapPin, Users, Heart, Trophy, BookOpen, School, PartyPopper } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import GlassCard from '../glass/GlassCard';
import GlassButton from '../glass/GlassButton';

const EventCard = ({ 
  event, 
  onPress, 
  onRegister, 
  onUnregister,
  showActions = true,
  style 
}) => {
  const { isDark } = useTheme();

  const getCategoryIcon = (category) => {
    const iconProps = { size: 16, color: '#fff' };
    switch (category) {
      case 'meetup': return <Users {...iconProps} />;
      case 'training': return <School {...iconProps} />;
      case 'adoption': return <Heart {...iconProps} />;
      case 'competition': return <Trophy {...iconProps} />;
      case 'social': return <PartyPopper {...iconProps} />;
      case 'educational': return <BookOpen {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  const getCategoryColorClass = (category) => {
    switch (category) {
      case 'meetup': return 'bg-primary-500';
      case 'training': return 'bg-secondary-500';
      case 'adoption': return 'bg-success-500';
      case 'competition': return 'bg-warning-500';
      case 'social': return 'bg-accent-500';
      case 'educational': return 'bg-error-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isRegistered = event.user_registration;
  const isFull = event.registered_count >= event.capacity;
  const isPast = new Date(event.event_date) < new Date();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={style}>
      <GlassCard className="m-2 overflow-hidden">
        <Image 
          source={{ uri: event.photo_url || 'https://via.placeholder.com/300x200?text=No+Photo' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="mb-3">
            <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {event.title}
            </Text>
            <View className="flex-row items-center">
              <View className={`w-6 h-6 rounded-full ${getCategoryColorClass(event.category)} items-center justify-center mr-2`}>
                {getCategoryIcon(event.category)}
              </View>
              <View className={`px-3 py-1 rounded-full ${getCategoryColorClass(event.category)}/20 border ${getCategoryColorClass(event.category)}/30`}>
                <Text className={`text-xs font-semibold ${getCategoryColorClass(event.category).replace('bg-', 'text-')}`}>
                  {event.category?.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <Text className={`mb-4 leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={2}>
            {event.description}
          </Text>

          <View className="mb-4 space-y-2">
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <Calendar size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text className={`flex-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatDate(event.event_date)} at {formatTime(event.start_time)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <MapPin size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text className={`flex-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {event.location}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded-full items-center justify-center mr-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <Users size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <Text className={`flex-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {event.registered_count}/{event.capacity} registered
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-primary-500">
              {event.price === 0 ? 'FREE' : `$${event.price}`}
            </Text>
            
            {showActions && !isPast && (
              <View className="flex-1 items-end">
                {isRegistered ? (
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onPress={() => onUnregister?.(event)}
                  >
                    <Text className={isDark ? 'text-white' : 'text-gray-900'}>Unregister</Text>
                  </GlassButton>
                ) : (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onPress={() => onRegister?.(event)}
                    disabled={isFull}
                  >
                    <Text className="text-white">{isFull ? 'Full' : 'Register'}</Text>
                  </GlassButton>
                )}
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};


export default EventCard;
