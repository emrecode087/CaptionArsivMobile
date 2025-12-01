import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useBlockCategoryMutation, useUnblockCategoryMutation } from '../data/useBlocksMutations';

export const BlockCategoriesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState('');
  const blockMutation = useBlockCategoryMutation();
  const unblockMutation = useUnblockCategoryMutation();

  const handleAction = (action: 'block' | 'unblock') => {
    const value = categoryId.trim();
    if (!value) return;
    const mutateFn = action === 'block' ? blockMutation.mutateAsync : unblockMutation.mutateAsync;
    mutateFn(value)
      .then(() => Alert.alert('Başarılı', action === 'block' ? 'Kategori engellendi' : 'Engel kaldırıldı'))
      .catch(() => Alert.alert('Hata', 'İşlem gerçekleştirilemedi'));
  };

  const isLoading = blockMutation.isPending || unblockMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>Engellenmiş Kategoriler</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>Kategori ID</Text>
        <TextInput
          value={categoryId}
          onChangeText={setCategoryId}
          placeholder="UUID"
          placeholderTextColor={colors.text.tertiary}
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text.primary },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.error, opacity: isLoading ? 0.6 : 1 }]}
            onPress={() => handleAction('block')}
            disabled={isLoading}
          >
            {isLoading && blockMutation.isPending ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.surface }]}>Engelle</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }]}
            onPress={() => handleAction('unblock')}
            disabled={isLoading}
          >
            {isLoading && unblockMutation.isPending ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.surface }]}>Engeli Kaldır</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.subtitle1,
    fontWeight: '700',
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyBold,
  },
});
