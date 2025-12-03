import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useUnblockCategoryMutation } from '../data/useBlocksMutations';
import { useBlockedListQuery, useUpdateBlockedCache } from '../data/useBlocksQuery';

export const BlockCategoriesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const unblockMutation = useUnblockCategoryMutation();
  const { data, isLoading: isFetching } = useBlockedListQuery();
  const updateCache = useUpdateBlockedCache();
  const categories = data?.categories ?? [];

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleUnblock = (id: string, name?: string | null) => {
    Alert.alert('Engeli kaldir', `${name ?? 'Kategori'} engel kaldirilsin mi?`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Kaldir',
        style: 'destructive',
        onPress: () => {
          unblockMutation.mutate(id, {
            onSuccess: () => {
              updateCache((prev) => (prev ? { ...prev, categories: (prev.categories ?? []).filter((c) => c.id !== id) } : prev));
              Alert.alert('Engel kaldirildi', `${name ?? 'Kategori'} artik engelli degil.`);
            },
            onError: () => Alert.alert('Hata', 'Islem tamamlanamadi.'),
          });
        },
      },
    ]);
  };

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
        {isFetching ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.text.tertiary }]}>Engellenmis kategori yok.</Text>
            }
            renderItem={({ item }) => (
              <View style={[styles.tagRow, { borderColor: colors.border }]}>
                <View style={styles.categoryInfo}>
                  <Ionicons name="folder-open-outline" size={18} color={colors.text.secondary} />
                  <View style={{ gap: 2 }}>
                    <Text style={[styles.tagText, { color: colors.text.primary }]}>{item.name || 'Kategori'}</Text>
                    <Text style={[styles.idText, { color: colors.text.tertiary }]}>{item.id}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleUnblock(item.id, item.name)} disabled={unblockMutation.isPending}>
                  {unblockMutation.isPending ? (
                    <ActivityIndicator color={colors.error} />
                  ) : (
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  )}
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
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
      flex: 1,
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    tagText: {
      ...typography.body,
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    idText: {
      ...typography.small,
    },
    empty: {
      ...typography.body2,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

export default BlockCategoriesScreen;
