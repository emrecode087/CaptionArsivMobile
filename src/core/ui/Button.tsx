import { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { borderRadius, colors, spacing } from '@/core/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = memo<ButtonProps>(
  ({
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    fullWidth = false,
    icon,
    disabled,
    style,
    textStyle,
    ...props
  }) => {
    const containerStyle = [
      styles.base,
      styles[variant],
      styles[`${size}Size`],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ];

    const labelStyle = [
      styles.text,
      styles[`${variant}Text`],
      styles[`${size}Text`],
      disabled && styles.disabledText,
      textStyle,
    ];

    return (
      <TouchableOpacity
        {...props}
        disabled={disabled || loading}
        style={containerStyle}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.text.inverse}
          />
        ) : (
          <>
            {icon}
            <Text style={labelStyle}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  smallSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediumSize: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  largeSize: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: colors.text.inverse,
    fontSize: 16,
  },
  secondaryText: {
    color: colors.text.inverse,
    fontSize: 16,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
  },
  ghostText: {
    color: colors.primary,
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.7,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
