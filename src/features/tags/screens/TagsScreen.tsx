import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useTagsQuery, useUpdateTagMutation } from '../data/useTagsQuery';
import { CustomHeader } from '@/core/ui/CustomHeader';

export const TagsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: tags, isLoading, refetch } = useTagsQuery();
  const updateMutation = useUpdateTagMutation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        listContent: {
          padding: spacing.md,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 1,
          borderColor: colors.border,
        },
        tagName: {
          ...typography.bodyBold,
          color: colors.text.primary,
        },
        tagSlug: {
          ...typography.caption,
          color: colors.text.secondary,
        },
        featuredContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        featuredLabel: {
          ...typography.caption,
          color: colors.text.tertiary,
        },
      }),
    [colors]
  );

  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { isFeatured: !currentStatus },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.tagName}>#{item.name}</Text>
        <Text style={styles.tagSlug}>{item.slug}</Text>
      </View>
      <View style={styles.featuredContainer}>
        <Text style={styles.featuredLabel}>
          {item.isFeatured ? 'Anasayfada' : 'Gizli'}
        </Text>
        <Switch
          value={item.isFeatured}
          onValueChange={() => handleToggleFeatured(item.id, item.isFeatured)}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Tagları Yönet" showBack />
      <FlatList
        data={Array.isArray(tags) ? tags : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
    </View>
  );
};
