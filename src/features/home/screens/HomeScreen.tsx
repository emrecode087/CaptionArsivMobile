import { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View, RefreshControl, Animated, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { PostCard } from '@/features/posts/ui/PostCard';
import { HomeTags } from '@/features/tags/ui/HomeTags';

interface HomeScreenProps {
  filter?: 'forYou' | 'top' | 'fresh';
  onScroll?: any;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const HomeScreen = memo(({ filter = 'forYou', onScroll, contentContainerStyle }: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuthStore();

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

  // Determine feed type and filters
  const feedType = filter === 'top' ? 'Popular' : filter === 'fresh' ? 'New' : 'Home';
  const onlyFollowedTags = filter === 'forYou' && isAuthenticated;

  const { data: posts, isLoading, refetch } = usePostsQuery({
    feedType,
    onlyFollowedTags,
    includePrivate: false,
    includeDeleted: false,
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>😴</Text>
      <Text style={styles.emptyTitle}>Henüz bir şey yok</Text>
      <Text style={styles.emptyText}>
        {isAuthenticated 
          ? 'Takip ettiğiniz kategori veya etiketlerden henüz gönderi yok. Keşfetmeye başlayın!' 
          : 'Bu akışta henüz gönderi bulunmuyor.'}
      </Text>
    </View>
  );

  const handleTagPress = (tag: string | null) => {
    if (tag) {
      navigation.navigate('TagPosts', { tag });
    }
  };

  const renderHeader = () => (
    <HomeTags selectedTagId={null} onSelectTag={handleTagPress} />
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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';
