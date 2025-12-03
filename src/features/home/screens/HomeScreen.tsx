import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, RefreshControl, Animated, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';

interface HomeScreenProps {
  filter?: 'forYou' | 'top' | 'fresh';
  onScroll?: any;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const HomeScreen = memo(({ filter = 'forYou', onScroll, contentContainerStyle }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 0,
      paddingBottom: 100,
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
  }), [colors]);

  // TODO: Implement actual sorting in API based on filter
  const { data: allPosts, isLoading: isLoadingAll, refetch: refetchAll } = usePostsQuery({
    includePrivate: false,
    includeDeleted: false,
    // sortBy: filter === 'top' ? 'likes' : filter === 'fresh' ? 'date' : undefined
  });

  const posts = allPosts;
  const isLoading = isLoadingAll;
  const refetch = refetchAll;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>😴</Text>
      <Text style={styles.emptyTitle}>Henüz bir şey yok</Text>
      <Text style={styles.emptyText}>
        Bu akışta henüz gönderi bulunmuyor.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';
