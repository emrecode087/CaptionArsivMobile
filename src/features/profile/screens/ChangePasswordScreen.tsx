import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/core/theme/useTheme';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { Button } from '@/core/ui/Button';
import { PasswordInput } from '@/core/ui/Input';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useChangePasswordMutation } from '@/features/profile/data/useProfileMutations';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const changePasswordMutation = useChangePasswordMutation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const errors: { current?: string; next?: string; confirm?: string } = {};

    if (!currentPassword.trim()) {
      errors.current = 'Mevcut sifreyi yaz';
    }

    if (!newPassword.trim()) {
      errors.next = 'Yeni sifreyi yaz';
    } else if (newPassword.length < 8) {
      errors.next = 'En az 8 karakter kullan';
    } else if (newPassword === currentPassword) {
      errors.next = 'Yeni sifre mevcut sifreden farkli olmali';
    }

    if (confirmPassword !== newPassword) {
      errors.confirm = 'Sifreler eslesmiyor';
    }

    return errors;
  };

  const handleChangePassword = () => {
    if (!user) {
      setGeneralError('Oturum acman gerekiyor.');
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setGeneralError(null);

    changePasswordMutation.mutate(
      { userId: user.id, newPassword },
      {
        onSuccess: () => {
          Alert.alert('Sifre guncellendi', 'Guncel sifrenle tekrar giris yapabilirsin.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          navigation.goBack();
        },
        onError: (error: any) => {
          setGeneralError(error?.message ?? 'Sifre guncellenemedi');
        },
      },
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Sifre degistir</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Mevcut sifreni dogrula ve yeni sifreni belirle.
        </Text>

        <PasswordInput
          label="Mevcut sifre"
          placeholder="******"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.current}
        />

        <PasswordInput
          label="Yeni sifre"
          placeholder="******"
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.next}
        />

        <PasswordInput
          label="Yeni sifre (tekrar)"
          placeholder="******"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.confirm}
        />

        <Text style={[styles.hint, { color: colors.text.secondary }]}>
          En az 8 karakter, harf ve rakam karisimi guvende kalmani saglar.
        </Text>

        {generalError && <Text style={[styles.errorText, { color: colors.error }]}>{generalError}</Text>}

        <Button
          title="Sifreyi guncelle"
          onPress={handleChangePassword}
          loading={changePasswordMutation.isPending}
          fullWidth
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
    },
    card: {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 3,
    },
    title: {
      ...typography.h3,
    },
    subtitle: {
      ...typography.body,
      marginBottom: spacing.sm,
    },
    hint: {
      ...typography.caption,
      marginTop: spacing.xs,
    },
    errorText: {
      ...typography.body,
    },
    submitButton: {
      marginTop: spacing.md,
    },
  });

export default ChangePasswordScreen;
