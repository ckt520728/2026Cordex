/** Accessible UI primitives shared across screens. Large targets, high contrast. */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MIN_TAP_TARGET, palette, radius, spacing, typography } from '@/theme/tokens';

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: palette.textMuted }]}>{children}</Text>;
}

interface BigButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'neutral' | 'success' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BigButton({ label, onPress, variant = 'primary', disabled, style }: BigButtonProps) {
  const bg = {
    primary: palette.primary,
    neutral: palette.surfaceAlt,
    success: palette.success,
    danger: palette.danger,
  }[variant];
  const fg = variant === 'neutral' ? palette.text : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.md, gap: spacing.md },
  title: { fontSize: typography.title, fontWeight: typography.weightBold, color: palette.text },
  body: { fontSize: typography.body, color: palette.text, lineHeight: typography.body * 1.5 },
  button: {
    minHeight: MIN_TAP_TARGET,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { fontSize: typography.heading, fontWeight: typography.weightBold },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.sm,
  },
});
