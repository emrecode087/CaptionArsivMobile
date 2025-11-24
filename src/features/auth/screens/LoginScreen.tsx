import { memo, useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/core/ui/Button';
import { Input, PasswordInput } from '@/core/ui/Input';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import type { AuthStackParamList } from '../navigation/types';

import { useAuthStore } from '../stores/useAuthStore';
import { login as loginApi } from '../data/authApi';
import { ApiError } from '@/core/types/api';

interface LoginScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
}

export const LoginScreen = memo<LoginScreenProps>(({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginApi({ emailOrUserName: email, password });
      
      if (result.isSuccess && result.data) {
        const { accessToken, refreshToken, user } = result.data;
        login(accessToken, refreshToken, user);
      } else {
        Alert.alert('Giriş Başarısız', result.message || 'Kullanıcı adı veya şifre hatalı.');
      }
    } catch (error: any) {
      let errorMessage = 'Bir sorun oluştu. Lütfen tekrar deneyiniz.';

      if (error instanceof ApiError) {
        // Eğer backend'den gelen errors dizisi varsa, sadece onu gösterelim
        if (error.errors && error.errors.length > 0) {
          errorMessage = error.errors.map(e => (typeof e === 'string' ? e : e.message)).join('\n');
        } else {
          // Errors yoksa, mesajı kontrol edelim
          // "Request failed with status code 401" gibi teknik mesajları filtreleyelim
          if (error.message && !error.message.includes('Request failed with status code')) {
             errorMessage = error.message;
          } else if (error.status === 401) {
             errorMessage = 'Kullanıcı adı veya şifre hatalı.';
          } else {
             errorMessage = error.message;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Giriş Başarısız', errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Image 
              source={require('../../../../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
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

          <PasswordInput
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            autoComplete="password"
            textContentType="password"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPassword')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Şifrenizi mi unuttunuz?</Text>
          </TouchableOpacity>

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="large"
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Kayıt Olun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

LoginScreen.displayName = 'LoginScreen';

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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 120,
    height: 120,
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
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
