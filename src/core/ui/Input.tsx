import { memo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { borderRadius, colors, spacing, typography } from '@/core/theme/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = memo<InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, containerStyle, style, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
          ]}
        >
          {leftIcon}
          <TextInput
            {...props}
            style={[styles.input, leftIcon ? styles.inputWithLeftIcon : undefined, style]}
            placeholderTextColor={colors.text.tertiary}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
          />
          {rightIcon}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'secureTextEntry'> {
  onToggleVisibility?: (visible: boolean) => void;
}

export const PasswordInput = memo<PasswordInputProps>(({ onToggleVisibility, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    onToggleVisibility?.(newState);
  };

  return (
    <Input
      {...props}
      secureTextEntry={!isVisible}
      rightIcon={
        <TouchableOpacity onPress={toggleVisibility} style={styles.iconButton}>
          <Text style={styles.iconText}>{isVisible ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  error: {
    ...typography.small,
    color: colors.error,
  },
  hint: {
    ...typography.small,
    color: colors.text.secondary,
  },
  iconButton: {
    padding: spacing.xs,
  },
  iconText: {
    fontSize: 20,
  },
});
