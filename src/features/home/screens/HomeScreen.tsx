import { memo } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';

import { colors, spacing, typography } from '@/core/theme/tokens';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';

export const HomeScreen = memo(() => {
  const { data: posts, isLoading, refetch } = usePostsQuery({
    includePrivate: false,
    includeDeleted: false,
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>😴</Text>
      <Text style={styles.emptyTitle}>Henüz bir şey yok</Text>
      <Text style={styles.emptyText}>
        Takip ettiğin kategorilerde henüz paylaşım yapılmamış veya kimseyi takip etmiyorsun.
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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Bottom tab spacing
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
