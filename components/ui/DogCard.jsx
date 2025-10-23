import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import GlassCard from '../glass/GlassCard';

const DogCard = ({ 
  dog, 
  onPress, 
  onEdit, 
  onDelete, 
  showActions = false,
  style 
}) => {
  const { isDark } = useTheme();
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={style}>
      <GlassCard className="m-2 overflow-hidden">
        <Image 
          source={{ uri: dog.photo_url || 'https://via.placeholder.com/300x200?text=No+Photo' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dog.name}
              </Text>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
            <View className={`mb-3 p-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); onEdit?.(dog); }}
                className="py-2 px-3"
              >
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); onDelete?.(dog); }}
                className="py-2 px-3"
              >
                <Text className="text-error-500">Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row flex-wrap gap-2 mb-3">
            <View className="px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30">
              <Text className="text-primary-500 text-xs font-semibold">
                {dog.size?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View className="px-3 py-1.5 rounded-full bg-secondary-500/20 border border-secondary-500/30">
              <Text className="text-secondary-500 text-xs font-semibold">
                {dog.energy_level?.toUpperCase()}
              </Text>
            </View>
            <View className={`px-3 py-1.5 rounded-full ${isDark ? 'bg-white/10 border border-white/20' : 'bg-gray-100 border border-gray-300'}`}>
              <Text className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {dog.age} years
              </Text>
            </View>
          </View>

          <Text className={`mb-3 leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} numberOfLines={2}>
            {dog.description}
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${
                dog.availability_status === 'available' ? 'bg-success-500' : 'bg-error-500'
              }`} />
              <Text className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {dog.availability_status?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              📍 {dog.location}
            </Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};


export default DogCard;
