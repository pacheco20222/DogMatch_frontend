import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon, Smartphone, ChevronLeft, Check } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { GlassCard } from '../components/glass';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDark, isSystemTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      icon: Sun,
      description: 'Always use light theme',
      active: theme === 'light' && !isSystemTheme,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: Moon,
      description: 'Always use dark theme',
      active: theme === 'dark' && !isSystemTheme,
    },
    {
      id: 'system',
      label: 'System',
      icon: Smartphone,
      description: 'Match device settings',
      active: isSystemTheme,
    },
  ];

  const handleThemeChange = (themeId) => {
    switch (themeId) {
      case 'light':
        setLightTheme();
        break;
      case 'dark':
        setDarkTheme();
        break;
      case 'system':
        setSystemTheme();
        break;
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={isDark 
          ? ['#312E81', '#1E293B', '#0F172A'] 
          : ['#EEF2FF', '#F8FAFC', '#F8FAFC']
        }
        className="absolute top-0 left-0 right-0 h-64"
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View 
          entering={FadeIn.duration(400)}
          className="px-6 py-4 flex-row items-center"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center ${
              isDark ? 'bg-white/10' : 'bg-white/70'
            }`}>
              <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
            </View>
          </TouchableOpacity>
          
          <View>
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Customize your experience
            </Text>
          </View>
        </Animated.View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance Section */}
          <Animated.View entering={SlideInRight.delay(100).duration(400)}>
            <Text className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Appearance
            </Text>

            <GlassCard className="mb-6">
              {themeOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleThemeChange(option.id)}
                  className={`flex-row items-center py-4 ${
                    index < themeOptions.length - 1 ? 'border-b border-gray-200/20' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  {/* Icon */}
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    option.active 
                      ? (isDark ? 'bg-primary-500/30' : 'bg-primary-100')
                      : (isDark ? 'bg-white/5' : 'bg-gray-100')
                  }`}>
                    <option.icon 
                      size={24} 
                      className={
                        option.active 
                          ? 'text-primary-500'
                          : (isDark ? 'text-gray-400' : 'text-gray-600')
                      }
                    />
                  </View>

                  {/* Label & Description */}
                  <View className="flex-1 ml-4">
                    <Text className={`text-base font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.label}
                    </Text>
                    <Text className={`text-sm mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {option.description}
                    </Text>
                  </View>

                  {/* Check Icon */}
                  {option.active && (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center">
                        <Check size={18} className="text-white" />
                      </View>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              ))}
            </GlassCard>
          </Animated.View>

          {/* Coming Soon Section */}
          <Animated.View entering={SlideInRight.delay(200).duration(400)}>
            <Text className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              More Settings
            </Text>

            <GlassCard>
              <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Additional settings coming soon...
              </Text>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SettingsScreen;
