// Centralized design tokens for colors, spacing and radii
// Keep this file small and focused; add tokens as needed.
export function getDesignTokens(isDark) {
  if (isDark) {
    return {
      // Colors
      background: '#0F172A',
      surface: '#0F172A',
      cardBackground: '#1E293B',
      headerBackground: '#1E293B',
      headerBorder: '#334155',
      border: '#334155',
      primary: '#6366F1', // used as accent
      primaryVariant: '#4F8EF7',
      primaryContrast: '#FFFFFF',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      muted: '#64748B',
      subtle: '#334155',
      avatarBackground: '#0B1220',
      bubbleIncoming: '#334155',
      bubbleOutgoing: '#4F8EF7',
      danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      inputBackground: '#334155',
      inputBorder: '#475569',
      inputText: '#FFFFFF',
      placeholder: '#64748B',

  // Gradients and overlay colors
  gradientBackground: ['#312E81', '#1E293B', '#0F172A'],
  gradientPrimary: ['#6366F1', '#EC4899', '#14B8A6'],
  overlayLikeBg: 'rgba(99,102,241,0.9)',
  overlayPassBg: 'rgba(239,68,68,0.9)',
  overlaySuperLikeBg: 'rgba(236,72,153,0.9)',
  actionPassBg: 'rgba(239,68,68,0.2)',
  actionPassBorder: 'rgba(239,68,68,0.4)',
  actionLikeBg: 'rgba(99,102,241,0.9)',
  actionLikeShadow: '#000000',
  actionSuperLikeBg: 'rgba(236,72,153,0.9)',

      // Spacing & sizing
      spacingSmall: 8,
      spacing: 12,
      spacingLarge: 16,
      borderRadius: 24,
      smallRadius: 8,
      avatarSize: 40,

      // Typography sizes
      fontSizeBase: 16,
      fontSizeLg: 18,
      fontSizeSm: 14,
    };
  }

  // Light theme tokens
  return {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    cardBackground: '#F3F4F6',
    headerBackground: '#FFFFFF',
    headerBorder: '#E5E7EB',
    border: '#E5E7EB',
    primary: '#6366F1',
    primaryVariant: '#4F8EF7',
    primaryContrast: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    muted: '#9CA3AF',
    subtle: '#F9FAFB',
    avatarBackground: '#F3F4F6',
    bubbleIncoming: '#F3F4F6',
    bubbleOutgoing: '#4F8EF7',
    danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
    inputBackground: '#F9FAFB',
    inputBorder: '#E5E7EB',
    inputText: '#1F2937',
    placeholder: '#9CA3AF',

  // Price badge backgrounds
  priceBgWarning: '#FEF3C7',
  priceBgSuccess: '#D1FAE5',

  // Gradients and overlay colors (light)
  gradientBackground: ['#EEF2FF', '#F8FAFC', '#F8FAFC'],
  gradientPrimary: ['#6366F1', '#EC4899', '#14B8A6'],
  overlayLikeBg: 'rgba(99,102,241,0.9)',
  overlayPassBg: 'rgba(239,68,68,0.9)',
  overlaySuperLikeBg: 'rgba(236,72,153,0.9)',
  actionPassBg: 'rgba(239,68,68,0.1)',
  actionPassBorder: 'rgba(239,68,68,0.25)',
  actionLikeBg: 'rgba(99,102,241,0.9)',
  actionLikeShadow: '#6366F1',
  actionSuperLikeBg: 'rgba(236,72,153,0.9)',

    spacingSmall: 8,
    spacing: 12,
    spacingLarge: 16,
    borderRadius: 24,
    smallRadius: 8,
    avatarSize: 40,

    fontSizeBase: 16,
    fontSizeLg: 18,
    fontSizeSm: 14,
  };
}
