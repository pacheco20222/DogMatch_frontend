import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from '../styles/DesignSystem';

// Light theme configuration
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors
    primary: Colors.primary[500],
    primaryContainer: Colors.primary[100],
    onPrimary: Colors.text.inverse,
    onPrimaryContainer: Colors.primary[900],
    
    // Secondary colors
    secondary: Colors.secondary[500],
    secondaryContainer: Colors.secondary[100],
    onSecondary: Colors.text.inverse,
    onSecondaryContainer: Colors.secondary[900],
    
    // Tertiary colors
    tertiary: Colors.neutral[500],
    tertiaryContainer: Colors.neutral[100],
    onTertiary: Colors.text.inverse,
    onTertiaryContainer: Colors.neutral[900],
    
    // Error colors
    error: Colors.error[500],
    errorContainer: Colors.error[50],
    onError: Colors.text.inverse,
    onErrorContainer: Colors.error[900],
    
    // Background colors
    background: Colors.background.primary,
    onBackground: Colors.text.primary,
    surface: Colors.background.primary,
    onSurface: Colors.text.primary,
    surfaceVariant: Colors.background.secondary,
    onSurfaceVariant: Colors.text.secondary,
    
    // Outline colors
    outline: Colors.neutral[300],
    outlineVariant: Colors.neutral[200],
    
    // Shadow colors
    shadow: Colors.neutral[900],
    scrim: Colors.neutral[900],
    
    // Inverse colors
    inverseSurface: Colors.neutral[800],
    onInverseSurface: Colors.text.inverse,
    inversePrimary: Colors.primary[300],
    
    // Surface tint
    surfaceTint: Colors.primary[500],
    
    // Custom colors for our app
    success: Colors.success[500],
    successContainer: Colors.success[50],
    onSuccess: Colors.text.inverse,
    onSuccessContainer: Colors.success[900],
    
    warning: Colors.warning[500],
    warningContainer: Colors.warning[50],
    onWarning: Colors.text.inverse,
    onWarningContainer: Colors.warning[900],
    
    // Text colors
    textPrimary: Colors.text.primary,
    textSecondary: Colors.text.secondary,
    textTertiary: Colors.text.tertiary,
    textInverse: Colors.text.inverse,
  },
  roundness: 12,
  fonts: {
    ...MD3LightTheme.fonts,
    // Custom font configurations
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 38,
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 26,
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 24,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 18,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 14,
    },
  },
};

// Dark theme configuration
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors
    primary: Colors.primary[300],
    primaryContainer: Colors.primary[800],
    onPrimary: Colors.primary[900],
    onPrimaryContainer: Colors.primary[100],
    
    // Secondary colors
    secondary: Colors.secondary[300],
    secondaryContainer: Colors.secondary[800],
    onSecondary: Colors.secondary[900],
    onSecondaryContainer: Colors.secondary[100],
    
    // Tertiary colors
    tertiary: Colors.neutral[300],
    tertiaryContainer: Colors.neutral[800],
    onTertiary: Colors.neutral[900],
    onTertiaryContainer: Colors.neutral[100],
    
    // Error colors
    error: Colors.error[300],
    errorContainer: Colors.error[800],
    onError: Colors.error[900],
    onErrorContainer: Colors.error[100],
    
    // Background colors
    background: Colors.neutral[900],
    onBackground: Colors.text.inverse,
    surface: Colors.neutral[800],
    onSurface: Colors.text.inverse,
    surfaceVariant: Colors.neutral[700],
    onSurfaceVariant: Colors.text.inverse,
    
    // Outline colors
    outline: Colors.neutral[600],
    outlineVariant: Colors.neutral[700],
    
    // Shadow colors
    shadow: Colors.neutral[900],
    scrim: Colors.neutral[900],
    
    // Inverse colors
    inverseSurface: Colors.neutral[100],
    onInverseSurface: Colors.text.primary,
    inversePrimary: Colors.primary[700],
    
    // Surface tint
    surfaceTint: Colors.primary[300],
    
    // Custom colors for our app
    success: Colors.success[300],
    successContainer: Colors.success[800],
    onSuccess: Colors.success[900],
    onSuccessContainer: Colors.success[100],
    
    warning: Colors.warning[300],
    warningContainer: Colors.warning[800],
    onWarning: Colors.warning[900],
    onWarningContainer: Colors.warning[100],
    
    // Text colors
    textPrimary: Colors.text.inverse,
    textSecondary: Colors.neutral[300],
    textTertiary: Colors.neutral[400],
    textInverse: Colors.text.primary,
  },
  roundness: 12,
  fonts: {
    ...lightTheme.fonts, // Use same font configuration
  },
};

// Default theme (light)
export const paperTheme = lightTheme;

// Theme variants
export const themeVariants = {
  light: lightTheme,
  dark: darkTheme,
};

// Helper function to get theme colors
export const getThemeColors = (theme) => ({
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  error: theme.colors.error,
  success: theme.colors.success,
  warning: theme.colors.warning,
  background: theme.colors.background,
  surface: theme.colors.surface,
  text: theme.colors.onSurface,
  textSecondary: theme.colors.onSurfaceVariant,
  outline: theme.colors.outline,
});

// Helper function to get custom colors
export const getCustomColors = (theme) => ({
  // Brand colors
  brand: {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    tertiary: theme.colors.tertiary,
  },
  
  // Status colors
  status: {
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
    info: theme.colors.primary,
  },
  
  // Text colors
  text: {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    inverse: theme.colors.textInverse,
  },
  
  // Background colors
  background: {
    primary: theme.colors.background,
    secondary: theme.colors.surface,
    tertiary: theme.colors.surfaceVariant,
  },
  
  // Border colors
  border: {
    primary: theme.colors.outline,
    secondary: theme.colors.outlineVariant,
  },
});

export default paperTheme;
