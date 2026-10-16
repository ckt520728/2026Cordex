/**
 * Design tokens tuned for an aging audience (WCAG-AA+ contrast, large tap
 * targets, generous type). These defaults intentionally exceed typical mobile
 * sizing because the primary users are older adults, some with reduced vision.
 *
 * See docs/DESIGN_GUIDELINES.md for the rationale behind each value.
 */

export const palette = {
  bg: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3FA',
  primary: '#2563EB', // high-contrast blue
  primaryDark: '#1E40AF',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  text: '#111827', // near-black on light bg -> contrast > 13:1
  textMuted: '#4B5563',
  border: '#CBD5E1',
  // Distinct, color-blind-safe hues for stimulus frames / categories.
  slotColors: ['#2563EB', '#DC2626', '#15803D', '#B45309', '#7C3AED', '#0891B2'],
} as const;

export const typography = {
  // Large by design; smallest body text is 18pt.
  display: 40,
  title: 30,
  heading: 24,
  body: 20,
  label: 18,
  weightRegular: '400' as const,
  weightBold: '700' as const,
};

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
};

export const radius = {
  sm: 10,
  md: 18,
  lg: 28,
  pill: 999,
};

/** Minimum accessible tap target (Apple HIG 44pt; we use 64 for older hands). */
export const MIN_TAP_TARGET = 64;
