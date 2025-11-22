import React, { memo, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

import { colors, spacing, typography } from '@/core/theme/tokens';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';
import { useCategoriesQuery } from '@/features/categories/data/useCategoriesQuery';

type CategoryPostsRouteProp = RouteProp<{
  CategoryPosts: { categoryId: string; categoryName: string };
}, 'CategoryPosts'>;

export const CategoryPostsScreen = memo(() => {
  const route = useRoute<CategoryPostsRouteProp>();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params;

  const { data: posts, isLoading, refetch, isRefetching } = usePostsQuery({
    categoryId,
    includePrivate: false,
    includeDeleted: false,
  });

  useEffect(() => {
    navigation.setOptions({ title: categoryName });
  }, [categoryName, navigation]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📂</Text>
      <Text style={styles.emptyTitle}>Bu kategoride içerik yok</Text>
      <Text style={styles.emptyText}>
        Henüz bu kategoriye ait bir gönderi paylaşılmamış.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
