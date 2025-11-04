import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Calendar, MapPin, Users, Heart, Trophy, BookOpen, School, PartyPopper } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getDesignTokens } from '../../styles/designTokens';
import GlassCard from '../glass/GlassCard';
import GlassButton from '../glass/GlassButton';

const EventCard = React.memo(({ 
  event, 
  onPress, 
  onRegister, 
  onUnregister,
  showActions = true,
  style 
}) => {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'meetup': return tokens.primary;
      case 'training': return tokens.primaryVariant || tokens.primary;
      case 'adoption': return tokens.success;
      case 'competition': return tokens.warning;
      case 'social': return tokens.primary;
      case 'educational': return tokens.danger;
      default: return tokens.muted || '#9CA3AF';
    }
  };

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const h = hex.replace('#','');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
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
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="mb-3">
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, color: isDark ? tokens.textPrimary : tokens.textPrimary }}>
              {event.title}
            </Text>
            <View className="flex-row items-center">
              <View style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: getCategoryColor(event.category), alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                {getCategoryIcon(event.category)}
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: hexToRgba(getCategoryColor(event.category), 0.15), borderWidth: 1, borderColor: hexToRgba(getCategoryColor(event.category), 0.25) }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: getCategoryColor(event.category) }}>
                  {event.category?.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ marginBottom: 12, lineHeight: 20, color: isDark ? tokens.textSecondary : tokens.textSecondary }} numberOfLines={2}>
            {event.description}
          </Text>

          <View style={{ marginBottom: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: isDark ? hexToRgba('#FFFFFF', 0.06) : tokens.cardBackground }}>
                <Calendar size={14} color={isDark ? tokens.muted : tokens.muted} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {formatDate(event.event_date)} at {formatTime(event.start_time)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: isDark ? hexToRgba('#FFFFFF', 0.06) : tokens.cardBackground }}>
                <MapPin size={14} color={isDark ? tokens.muted : tokens.muted} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {event.location}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: isDark ? hexToRgba('#FFFFFF', 0.06) : tokens.cardBackground }}>
                <Users size={14} color={isDark ? tokens.muted : tokens.muted} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {event.registered_count}/{event.capacity} registered
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text style={{ fontSize: 18, fontWeight: '700', color: tokens.primary }}>
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
                    <Text style={{ color: isDark ? tokens.textPrimary : tokens.textPrimary }}>Unregister</Text>
                  </GlassButton>
                ) : (
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onPress={() => onRegister?.(event)}
                    disabled={isFull}
                  >
                    <Text style={{ color: tokens.primaryContrast }}>{isFull ? 'Full' : 'Register'}</Text>
                  </GlassButton>
                )}
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;
