import { memo, useState } from 'react';
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
import { Input, PasswordInput } from '@/core/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/core/theme/tokens';
import type { AuthStackParamList } from '../navigation/types';

interface RegisterScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'Register'>;
}

export const RegisterScreen = memo<RegisterScreenProps>(({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    // TODO: Backend bağlantısı eklenecek
    setTimeout(() => {
      setLoading(false);
      console.log('Register:', { username, email, password, confirmPassword });
    }, 1500);
  };

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
            <Text style={styles.logo}>📝</Text>
          </View>
          <Text style={styles.title}>Hesap Oluşturun</Text>
          <Text style={styles.subtitle}>Hemen başlamak için kayıt olun</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Kullanıcı Adı"
            placeholder="kullaniciadi"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
            textContentType="username"
          />

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

          <PasswordInput
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            autoComplete="password-new"
            textContentType="newPassword"
            hint="En az 8 karakter olmalıdır"
          />

          <PasswordInput
            label="Şifre Tekrar"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="password-new"
            textContentType="newPassword"
          />

          <Button
            title="Kayıt Ol"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="large"
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Giriş Yapın</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

RegisterScreen.displayName = 'RegisterScreen';

const styles = StyleSheet.create({
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
    marginBottom: spacing.xl,
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
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footerLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
