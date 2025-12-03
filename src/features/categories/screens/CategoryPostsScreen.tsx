import React, { memo, useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { useCategoryQuery, useFollowCategoryMutation, useUnfollowCategoryMutation } from '../data/useCategoriesQuery';
import { PostCard } from '@/features/posts/ui/PostCard';
import { Post } from '@/features/posts/domain/types';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

type CategoryPostsRouteProp = RouteProp<{
  CategoryPosts: { categoryId: string; categoryName: string };
}, 'CategoryPosts'>;

export const CategoryPostsScreen = memo(() => {
  const route = useRoute<CategoryPostsRouteProp>();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params;
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'hot' | 'fresh' | 'about'>('hot');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: category } = useCategoryQuery(categoryId);
  const followMutation = useFollowCategoryMutation();
  const unfollowMutation = useUnfollowCategoryMutation();

  const { data: posts, isLoading, refetch, isRefetching } = usePostsQuery({
    categoryId,
    includePrivate: false,
    includeDeleted: false,
  });
  const fallbackThumbnail =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAucB9p7Yi4sAAAAASUVORK5CYII=';

  const categoryIcon = resolveMediaUrl(category?.iconUrl);
  const chipTags = useMemo(() => {
    const tagSet = new Set<string>();
    if (posts) {
      posts.forEach((p) => (p.tags ?? []).forEach((t) => tagSet.add(t)));
    }
    if (category?.name) {
      tagSet.add(category.name);
    }
    if (tagSet.size === 0 && category?.description) {
      category.description
        .split(' ')
        .filter((x) => x.length > 2)
        .slice(0, 4)
        .forEach((w) => tagSet.add(w));
    }
    return Array.from(tagSet).slice(0, 6);
  }, [category?.description, category?.name, posts]);

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    if (activeTab === 'fresh') {
      return [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    // hot: likeCount desc then newest
    return [...posts].sort((a, b) => {
      if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeTab, posts]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
    headerContainer: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl + insets.top * 0.25,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    headerContent: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    icon: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surfaceHighlight,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.text.primary,
      fontWeight: '700',
      textAlign: 'center',
    },
    headerDescription: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: typography.body.lineHeight * 1.2,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    chip: {
      backgroundColor: colors.surfaceHighlight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: {
      ...typography.body2,
      color: colors.text.primary,
    },
    followButton: {
      backgroundColor: colors.text.inverse,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      minWidth: '85%',
      alignItems: 'center',
      alignSelf: 'center',
    },
    followingButton: {
      backgroundColor: colors.surfaceHighlight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followButtonText: {
      ...typography.button,
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: '700',
    },
    followingButtonText: {
      color: colors.text.primary,
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingTop: spacing.md,
    },
    tabButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    tabText: {
      ...typography.body2,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: colors.text.primary,
      fontWeight: '700',
    },
    tabUnderline: {
      height: 3,
      width: '100%',
      borderRadius: 4,
      marginTop: spacing.xs,
    },
    listContent: {
      padding: spacing.md,
    },
        columnWrapper: {
          gap: spacing.md,
        },
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.background,
          opacity: 0.8,
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
        gridItem: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          overflow: 'hidden',
          marginBottom: spacing.md,
        },
        gridImage: {
          width: '100%',
          height: '100%',
        },
        gridPlaceholder: {
          ...StyleSheet.absoluteFillObject,
          padding: spacing.xs,
          justifyContent: 'space-between',
        },
        gridCaption: {
          ...typography.caption,
          fontSize: 10,
          color: colors.text.secondary,
        },
        gridIconContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        },
        gridIconOverlay: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.15)',
        },
        modalContainer: {
          flex: 1,
          backgroundColor: colors.background,
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        closeButton: {
          padding: spacing.xs,
        },
        fullPostScroll: {
          flex: 1,
        },
      }),
    [colors],
  );

  useEffect(() => {
    navigation.setOptions({ title: category?.name || categoryName });
  }, [category?.name, categoryName, navigation]);

  const handleFollowToggle = () => {
    if (!category) return;
    if (category.isFollowing) {
      unfollowMutation.mutate(category.id);
    } else {
      followMutation.mutate(category.id);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {categoryIcon && <Image source={{ uri: categoryIcon }} style={styles.icon} />}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category?.name || categoryName}
        </Text>
        {category?.description ? (
          <Text style={styles.headerDescription} numberOfLines={2}>
            {category.description}
          </Text>
        ) : (
          <Text style={[styles.headerDescription, { color: colors.text.tertiary }]}>
            Açıklama eklenmemiş.
          </Text>
        )}
        {chipTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {chipTags.map((tag) => (
              <TouchableOpacity key={tag} style={styles.chip}>
                <Text style={styles.chipText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity
          style={[styles.followButton, category?.isFollowing && styles.followingButton]}
          onPress={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending}
        >
          <Text style={[styles.followButtonText, category?.isFollowing && styles.followingButtonText]}>
            {category?.isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {(['hot', 'fresh', 'about'] as const).map((tabKey) => {
          const labels: Record<'hot' | 'fresh' | 'about', string> = {
            hot: 'Popüler',
            fresh: 'Yeni',
            about: 'Hakkında',
          };
          const isActive = activeTab === tabKey;
          return (
            <View key={tabKey} style={{ alignItems: 'center', flex: 1 }}>
              <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab(tabKey)}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{labels[tabKey]}</Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.tabUnderline,
                  { backgroundColor: isActive ? colors.primary : 'transparent' },
                ]}
              />
            </View>
          );
        })}
      </View>

      {activeTab === 'about' && (
        <View style={{ marginTop: spacing.xs }}>
          <Text style={[styles.headerDescription, { color: colors.text.secondary }]}>
            {category?.description || 'Bu kategori için açıklama yok.'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderGridItem = ({ item }: { item: Post }) => {
    const screenWidth = Dimensions.get('window').width;
    const gap = spacing.md;
    const padding = spacing.md;
    const itemSize = (screenWidth - padding * 2 - gap * 2) / 3;

    let imageUrl = item.thumbnailUrl || '';
    if (!imageUrl && item.embedHtml) {
      const imgMatch = item.embedHtml.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) imageUrl = imgMatch[1];
    }
    if (!imageUrl) {
      imageUrl = fallbackThumbnail;
    }
    const isFallback = imageUrl === fallbackThumbnail;

    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: itemSize, height: itemSize }]}
        onPress={() => setSelectedPost(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
        {isFallback && (
          <View style={styles.gridPlaceholder}>
            <Text style={styles.gridCaption} numberOfLines={4}>
              {item.caption}
            </Text>
            <View style={styles.gridIconContainer}>
              <Ionicons name="play-circle" size={24} color={colors.surface} />
            </View>
          </View>
        )}
        <View style={styles.gridIconOverlay}>
          <Ionicons name="play-circle" size={20} color="#ffffff" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>§Y"'</Text>
      <Text style={styles.emptyTitle}>Bu kategoride içerik yok</Text>
      <Text style={styles.emptyText}>Henüz bu kategoriye ait bir gönderi paylaşılmamış.</Text>
    </View>
  );

  const listData = activeTab === 'about' ? [] : sortedPosts;

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={listData}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={!isLoading && activeTab !== 'about' ? renderEmpty : null}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <Modal visible={!!selectedPost} animationType="slide" onRequestClose={() => setSelectedPost(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPost(null)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          {selectedPost && (
            <View style={styles.fullPostScroll}>
              <PostCard post={selectedPost} isDetailView={true} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
});
