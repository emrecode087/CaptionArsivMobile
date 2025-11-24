import { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { borderRadius, spacing } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';

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
    const { colors } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
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
      smallSize: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        minHeight: 32,
      },
      mediumSize: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        minHeight: 44,
      },
      largeSize: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        minHeight: 56,
      },
      fullWidth: {
        width: '100%',
      },
      disabled: {
        opacity: 0.5,
      },
      text: {
        fontWeight: '600',
        textAlign: 'center',
      },
      primaryText: {
        color: colors.text.inverse,
      },
      secondaryText: {
        color: colors.text.inverse,
      },
      outlineText: {
        color: colors.primary,
      },
      ghostText: {
        color: colors.primary,
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
      disabledText: {
        color: colors.text.tertiary,
      },
    }), [colors]);

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
