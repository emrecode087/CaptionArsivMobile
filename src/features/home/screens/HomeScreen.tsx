import { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { usePostsQuery, useFollowedCategoryPostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';

export const HomeScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    tabButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      position: 'relative',
      alignItems: 'center',
    },
    activeTabButton: {
    },
    tabText: {
      ...typography.h3,
      color: colors.text.secondary,
      fontSize: 16,
    },
    activeTabText: {
      color: colors.text.primary,
      fontWeight: 'bold',
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      width: 20,
      height: 3,
      backgroundColor: colors.primary,
      borderRadius: 1.5,
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
  }), [colors]);

  const { data: allPosts, isLoading: isLoadingAll, refetch: refetchAll } = usePostsQuery({
    includePrivate: false,
    includeDeleted: false,
  }, {
    enabled: activeTab === 'forYou',
  });

  const { data: followedPosts, isLoading: isLoadingFollowed, refetch: refetchFollowed } = useFollowedCategoryPostsQuery({
    enabled: activeTab === 'following',
  });

  const posts = activeTab === 'forYou' ? allPosts : followedPosts;
  const isLoading = activeTab === 'forYou' ? isLoadingAll : isLoadingFollowed;
  const refetch = activeTab === 'forYou' ? refetchAll : refetchFollowed;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>😴</Text>
      <Text style={styles.emptyTitle}>Henüz bir şey yok</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'forYou' 
          ? 'Henüz paylaşım yapılmamış.' 
          : 'Takip ettiğin kategorilerde henüz paylaşım yapılmamış veya kimseyi takip etmiyorsun.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'forYou' && styles.activeTabButton]} 
            onPress={() => setActiveTab('forYou')}
          >
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>Sana Özel</Text>
            {activeTab === 'forYou' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'following' && styles.activeTabButton]} 
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>Takip Edilenler</Text>
            {activeTab === 'following' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

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
