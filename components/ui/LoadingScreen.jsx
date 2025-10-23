import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const { isDark } = useTheme();
  
  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className={`mt-4 text-center text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {message}
        </Text>
      </View>
    </View>
  );
};


export default LoadingScreen;
