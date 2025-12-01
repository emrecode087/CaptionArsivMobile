import React, { memo, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl, Dimensions, TouchableOpacity, Image, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { useCategoryQuery, useFollowCategoryMutation, useUnfollowCategoryMutation } from '../data/useCategoriesQuery';
import { PostCard } from '@/features/posts/ui/PostCard';
import { Post } from '@/features/posts/domain/types';

type CategoryPostsRouteProp = RouteProp<{
  CategoryPosts: { categoryId: string; categoryName: string };
}, 'CategoryPosts'>;

export const CategoryPostsScreen = memo(() => {
  const route = useRoute<CategoryPostsRouteProp>();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params;
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { colors } = useTheme();

  const { data: category } = useCategoryQuery(categoryId);
  const followMutation = useFollowCategoryMutation();
  const unfollowMutation = useUnfollowCategoryMutation();

  const { data: posts, isLoading, refetch, isRefetching } = usePostsQuery({
    categoryId,
    includePrivate: false,
    includeDeleted: false,
  });
  const fallbackThumbnail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAucB9p7Yi4sAAAAASUVORK5CYII=';

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.sm,
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    headerInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    headerDescription: {
      ...typography.body,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsText: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    statsNumber: {
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    statsSeparator: {
      marginHorizontal: spacing.xs,
      color: colors.text.tertiary,
    },
    followButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      minWidth: 100,
      alignItems: 'center',
    },
    followingButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followButtonText: {
      ...typography.button,
      color: colors.surface,
      fontSize: 14,
    },
    followingButtonText: {
      color: colors.text.primary,
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
  }), [colors]);

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
      <View style={styles.headerTopRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{category?.name || categoryName}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              <Text style={styles.statsNumber}>{category?.postCount || 0}</Text> gönderi
            </Text>
            <Text style={styles.statsSeparator}>•</Text>
            <Text style={styles.statsText}>
              <Text style={styles.statsNumber}>{category?.followerCount || 0}</Text> takipçi
            </Text>
          </View>
        </View>
        
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
      
      {category?.description && (
        <Text style={styles.headerDescription}>{category.description}</Text>
      )}
    </View>
  );

  const renderGridItem = ({ item }: { item: Post }) => {
    const screenWidth = Dimensions.get('window').width;
    const gap = spacing.md;
    const padding = spacing.md;
    const itemSize = (screenWidth - (padding * 2) - (gap * 2)) / 3;

    // Try to find an image in embedHtml if thumbnailUrl is missing
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
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.gridImage} 
          resizeMode="cover" 
        />
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
        ListHeaderComponent={renderHeader}
        data={posts}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
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

      <Modal
        visible={!!selectedPost}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
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
