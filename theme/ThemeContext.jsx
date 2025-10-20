import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setTheme] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update theme when device theme changes (only if using system theme)
  useEffect(() => {
    if (isSystemTheme) {
      setTheme(deviceColorScheme || 'light');
    }
  }, [deviceColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedIsSystemTheme = await AsyncStorage.getItem('isSystemTheme');
      
      if (savedIsSystemTheme !== null) {
        const isSystem = savedIsSystemTheme === 'true';
        setIsSystemTheme(isSystem);
        
        if (isSystem) {
          setTheme(deviceColorScheme || 'light');
        } else if (savedTheme) {
          setTheme(savedTheme);
        }
      } else {
        // Default to system theme
        setTheme(deviceColorScheme || 'light');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsSystemTheme(false);
    try {
      await AsyncStorage.setItem('theme', newTheme);
      await AsyncStorage.setItem('isSystemTheme', 'false');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setSystemTheme = async () => {
    setIsSystemTheme(true);
    setTheme(deviceColorScheme || 'light');
    try {
      await AsyncStorage.setItem('isSystemTheme', 'true');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setLightTheme = async () => {
    setTheme('light');
    setIsSystemTheme(false);
    try {
      await AsyncStorage.setItem('theme', 'light');
      await AsyncStorage.setItem('isSystemTheme', 'false');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setDarkTheme = async () => {
    setTheme('dark');
    setIsSystemTheme(false);
    try {
      await AsyncStorage.setItem('theme', 'dark');
      await AsyncStorage.setItem('isSystemTheme', 'false');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        isSystemTheme,
        toggleTheme,
        setSystemTheme,
        setLightTheme,
        setDarkTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
