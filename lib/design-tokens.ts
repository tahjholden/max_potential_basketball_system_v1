// Design Tokens - Centralized design system values
// This file contains all the design tokens used throughout the application

export const colors = {
  // Primary brand colors
  gold: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#C2B56B', // Primary brand gold
    600: '#d8cc97',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  
  // Semantic colors
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#A22828', // Brand red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Archive colors
  archive: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

export const typography = {
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-medium',
  h4: 'text-base font-medium',
  body: 'text-sm',
  caption: 'text-xs',
  button: 'text-sm font-semibold',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Semantic color mappings for easy use
export const semanticColors = {
  primary: colors.gold[500],
  primaryLight: colors.gold[400],
  primaryDark: colors.gold[600],
  
  danger: colors.danger[500],
  dangerLight: colors.danger[400],
  dangerDark: colors.danger[600],
  
  success: colors.success[500],
  successLight: colors.success[400],
  successDark: colors.success[600],
  
  warning: colors.warning[500],
  warningLight: colors.warning[400],
  warningDark: colors.warning[600],
  
  archive: colors.archive[500],
  archiveLight: colors.archive[400],
  archiveDark: colors.archive[600],
  
  gray: colors.gray[500],
  grayLight: colors.gray[400],
  grayDark: colors.gray[600],
};

// CSS custom properties for use in CSS
export const cssVariables = {
  '--color-gold': colors.gold[500],
  '--color-gold-light': colors.gold[400],
  '--color-gold-dark': colors.gold[600],
  '--color-danger': colors.danger[500],
  '--color-danger-light': colors.danger[400],
  '--color-danger-dark': colors.danger[600],
  '--color-success': colors.success[500],
  '--color-success-light': colors.success[400],
  '--color-success-dark': colors.success[600],
  '--color-warning': colors.warning[500],
  '--color-warning-light': colors.warning[400],
  '--color-warning-dark': colors.warning[600],
  '--color-archive': colors.archive[500],
  '--color-archive-light': colors.archive[400],
  '--color-archive-dark': colors.archive[600],
  '--color-gray': colors.gray[500],
  '--color-gray-light': colors.gray[400],
  '--color-gray-dark': colors.gray[600],
};

// Export everything for easy importing
export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  transitions,
  semanticColors,
  cssVariables,
}; 