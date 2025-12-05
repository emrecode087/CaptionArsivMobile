import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { Button } from '@/core/ui/Button';
import { useSendFeedbackMutation } from '../data/useProfileMutations';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const SendFeedbackScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState(user?.email || '');
  
  const sendFeedbackMutation = useSendFeedbackMutation();

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Hata', 'Lütfen bir mesaj yazın.');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('Hata', 'Lütfen iletişim bilgisi girin.');
      return;
    }

    sendFeedbackMutation.mutate(
      { message, contact },
      {
        onSuccess: () => {
          Alert.alert(
            'Teşekkürler',
            'Geri bildiriminiz başarıyla gönderildi.',
            [{ text: 'Tamam', onPress: () => navigation.goBack() }]
          );
        },
        onError: (error) => {
          Alert.alert('Hata', error.message || 'Geri bildirim gönderilemedi.');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Geri Bildirim Gönder
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Uygulamayı geliştirmemize yardımcı olun. Hata bildirimleri, öneriler veya sadece merhaba demek için bize yazın.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Mesajınız</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Düşüncelerinizi buraya yazın..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>İletişim (E-posta)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text.primary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="ornek@email.com"
              placeholderTextColor={colors.text.tertiary}
              value={contact}
              onChangeText={setContact}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={[styles.hint, { color: colors.text.tertiary }]}>
              Size geri dönüş yapabilmemiz için gereklidir.
            </Text>
          </View>

          <Button
            title="Gönder"
            onPress={handleSubmit}
            loading={sendFeedbackMutation.isPending}
            disabled={!message.trim() || !contact.trim()}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.subtitle2,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  textArea: {
    height: 150,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
  },
  hint: {
    ...typography.caption,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
