import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image, Dimensions, Modal, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CollectionDetailScreenRouteProp } from '../navigation/types';
import { useCollectionDetailQuery, useRemovePostFromCollectionMutation } from '../data/useCollectionsQuery';
import { usePostDetailQuery } from '../../posts/data/usePostsQuery';
import { PostCard } from '../../posts/ui/PostCard';
import { colors, spacing, typography, borderRadius } from '../../../core/theme/tokens';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { CollectionModal } from '../ui/CreateCollectionModal';
import { Post } from '../../posts/domain/types';
import { CollectionPost } from '../domain/types';

const PostDetailModalContent = ({ postId, onRemove, canManage }: { postId: string, onRemove: () => void, canManage: boolean }) => {
  const { data: post, isLoading, error } = usePostDetailQuery(postId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={{ padding: spacing.md, alignItems: 'center' }}>
        <Text style={{ color: colors.error, ...typography.body }}>Post yüklenemedi veya silinmiş.</Text>
      </View>
    );
  }

  return (
     <ScrollView contentContainerStyle={styles.fullPostScroll}>
        <PostCard post={post} />
        {canManage && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={onRemove}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={styles.removeButtonText}>Remove from Collection</Text>
          </TouchableOpacity>
        )}
     </ScrollView>
  );
};

export const CollectionDetailScreen = () => {
  const route = useRoute<CollectionDetailScreenRouteProp>();
  const { id } = route.params;
  const { user } = useAuthStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CollectionPost | null>(null);
  
  const { data, isLoading, error } = useCollectionDetailQuery(id, { includePosts: true });
  const removePostMutation = useRemovePostFromCollectionMutation();

  const collection = data?.data;
  const isOwner = user?.id === collection?.userId;
  const isModerator = user?.roles.includes('Moderator') || user?.roles.includes('SuperAdmin');
  const canManage = isOwner || isModerator;

  const handleRemovePost = (postId: string) => {
    Alert.alert(
      'Remove Post',
      'Are you sure you want to remove this post from the collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removePostMutation.mutate({ id, postId });
          },
        },
      ]
    );
  };

  const mapCollectionPostToPost = (collectionPost: CollectionPost): Post => {
    return {
      id: collectionPost.postId,
      userId: collectionPost.userId,
      userName: collectionPost.userName,
      caption: collectionPost.caption,
      thumbnailUrl: collectionPost.thumbnailUrl,
      isApproved: collectionPost.isApproved,
      isPrivate: collectionPost.isPrivate,
      createdAt: collectionPost.createdAt,
      // Map optional fields if available, otherwise defaults or nulls
      sourceUrl: collectionPost.sourceUrl || '',
      embedHtml: collectionPost.embedHtml || null,
      mediaType: collectionPost.mediaType || 'unknown',
      tags: [],
      likeCount: 0,
      commentCount: 0,
      isLikedByCurrentUser: false,
    };
  };

  const renderGridItem = ({ item }: { item: CollectionPost }) => {
    const screenWidth = Dimensions.get('window').width;
    const gap = spacing.md;
    const padding = spacing.md;
    const itemSize = (screenWidth - (padding * 2) - (gap * 2)) / 3;

    // Try to find an image in embedHtml if thumbnailUrl is missing
    let imageUrl = item.thumbnailUrl;
    if (!imageUrl && item.embedHtml) {
        const imgMatch = item.embedHtml.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
    }

    return (
      <TouchableOpacity 
        style={[styles.gridItem, { width: itemSize, height: itemSize }]} 
        onPress={() => setSelectedPost(item)}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.gridImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.gridPlaceholder}>
            <Text style={styles.gridCaption} numberOfLines={4}>
              {item.caption}
            </Text>
            <View style={styles.gridIconContainer}>
               <Ionicons name="play-circle" size={24} color={colors.surface} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !collection) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load collection details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{collection.name}</Text>
          {canManage && (
            <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.description}>{collection.description}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>{collection.postCount} Posts</Text>
          <Text style={styles.statText}>•</Text>
          <Text style={styles.statText}>{collection.isPrivate ? 'Private' : 'Public'}</Text>
        </View>
      </View>

      <FlatList
        data={collection.posts}
        keyExtractor={(item) => item.postId}
        renderItem={renderGridItem}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts in this collection</Text>
          </View>
        }
      />

      <CollectionModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        collection={collection}
      />

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
             <PostDetailModalContent 
               postId={selectedPost.postId} 
               canManage={!!canManage}
               onRemove={() => {
                  handleRemovePost(selectedPost.postId);
                  setSelectedPost(null);
               }}
             />
           )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  editButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  listContent: {
    padding: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    padding: spacing.xs,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCaption: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  gridIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: spacing.xs,
  },
  fullPostScroll: {
    padding: spacing.md,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
  },
  removeButtonText: {
    ...typography.bodyBold,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
