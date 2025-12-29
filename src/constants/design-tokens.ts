/**
 * Design Tokens - Centralized visual language for CLI Config Editor
 *
 * Usage:
 * - Import specific tokens: import { colors, typography } from '@/constants/design-tokens'
 * - For version display: import { APP_VERSION } from '@/constants/design-tokens'
 *
 * Colors:
 * - primary (indigo) - Main interactive elements, buttons, links
 * - secondary (emerald) - Success states, confirmations
 * - status - Success/warning/error/info states
 * - accent - Highlight colors for badges, tags
 *
 * Typography:
 * - xs (11px) - Metadata, timestamps, subtle text
 * - sm (12px) - Secondary text, descriptions
 * - base (14px) - Body text (default)
 * - lg+ - Headings
 *
 * Spacing:
 * - Uses 4px base unit (spacing[1] = 4px)
 * - Common: 2 (8px), 3 (12px), 4 (16px), 6 (24px)
 */

export const APP_VERSION = '0.1.0';
export const APP_NAME = 'CLI Config Editor';

export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  accent: {
    amber: '#f59e0b',
    rose: '#f43f5e',
    indigo: '#6366f1',
    emerald: '#10b981',
  },
} as const;

export const typography = {
  fontSizes: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '30px',
  },
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: {
    primary: '0 0 20px rgba(99, 102, 241, 0.3)',
    success: '0 0 20px rgba(16, 185, 129, 0.3)',
    error: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  properties: {
    color: 'color',
    background: 'background-color',
    transform: 'transform',
    opacity: 'opacity',
    shadow: 'box-shadow',
    common: 'color, background-color, border-color, box-shadow, transform, opacity',
  },
} as const;

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
  toast: 500,
} as const;
