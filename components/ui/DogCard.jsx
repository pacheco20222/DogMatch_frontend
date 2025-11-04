import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getDesignTokens } from '../../styles/designTokens';
import GlassCard from '../glass/GlassCard';

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace('#','');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const DogCard = React.memo(({ 
  dog, 
  onPress, 
  onEdit, 
  onDelete, 
  showActions = false,
  style 
}) => {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={style}>
      <GlassCard className="m-2 overflow-hidden">
        <Image 
          source={{ uri: dog.photo_url || 'https://via.placeholder.com/300x200?text=No+Photo' }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 4, color: isDark ? tokens.textPrimary : tokens.textPrimary }}>
                {dog.name}
              </Text>
              <Text style={{ color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {dog.breed}
              </Text>
            </View>
            {showActions && (
              <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                <MoreVertical size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            )}
          </View>

          {menuVisible && showActions && (
            <View style={{ marginBottom: 12, padding: 8, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : tokens.cardBackground }}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); onEdit?.(dog); }}
                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: isDark ? tokens.textPrimary : tokens.textPrimary }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); onDelete?.(dog); }}
                style={{ paddingVertical: 8, paddingHorizontal: 12 }}
              >
                <Text style={{ color: tokens.danger }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: hexToRgba(tokens.primary, 0.15), borderWidth: 1, borderColor: hexToRgba(tokens.primary, 0.25) }}>
              <Text style={{ color: tokens.primary, fontSize: 12, fontWeight: '700' }}>
                {dog.size?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: hexToRgba(tokens.primaryVariant || tokens.primary, 0.15), borderWidth: 1, borderColor: hexToRgba(tokens.primaryVariant || tokens.primary, 0.25) }}>
              <Text style={{ color: tokens.primaryVariant || tokens.primary, fontSize: 12, fontWeight: '700' }}>
                {dog.energy_level?.toUpperCase()}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : tokens.cardBackground, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : tokens.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {dog.age} years
              </Text>
            </View>
          </View>

          <Text style={{ marginBottom: 12, lineHeight: 20, color: isDark ? tokens.textSecondary : tokens.textSecondary }} numberOfLines={2}>
            {dog.description}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 999, marginRight: 8, backgroundColor: dog.availability_status === 'available' ? tokens.success : tokens.danger }} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
                {dog.availability_status?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: isDark ? tokens.textSecondary : tokens.textSecondary }}>
              📍 {dog.location}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});

DogCard.displayName = 'DogCard';

export default DogCard;
