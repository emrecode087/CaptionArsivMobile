import { memo, useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/core/ui/Button';
import { Input } from '@/core/ui/Input';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import type { AuthStackParamList } from '../navigation/types';

interface ResetPasswordScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
}

export const ResetPasswordScreen = memo<ResetPasswordScreenProps>(({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    // TODO: Backend bağlantısı eklenecek
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      console.log('Reset password email sent to:', email);
    }, 1500);
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✉️</Text>
          </View>
          <Text style={styles.successTitle}>E-posta Gönderildi</Text>
          <Text style={styles.successMessage}>
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </Text>
          <Button
            title="Giriş Sayfasına Dön"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            size="large"
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🔒</Text>
          </View>
          <Text style={styles.title}>Şifrenizi mi Unuttunuz?</Text>
          <Text style={styles.subtitle}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <Button
            title="Sıfırlama Bağlantısı Gönder"
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            size="large"
            style={styles.resetButton}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Giriş sayfasına dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

ResetPasswordScreen.displayName = 'ResetPasswordScreen';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  backLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    fontSize: 60,
  },
  successTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  backButton: {
    width: '100%',
  },
});
