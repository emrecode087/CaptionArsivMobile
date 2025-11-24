import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Collection } from '../domain/types';
import { spacing, borderRadius, typography } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLikeCollectionMutation, useUnlikeCollectionMutation } from '../data/useCollectionsQuery';
import { useAuthStore } from '../../auth/stores/useAuthStore';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress }) => {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const likeMutation = useLikeCollectionMutation();
  const unlikeMutation = useUnlikeCollectionMutation();

  const isOwner = user?.id === collection.userId;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: {
      gap: spacing.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...typography.h3,
      color: colors.text.primary,
      flex: 1,
      marginRight: spacing.sm,
    },
    description: {
      ...typography.body,
      color: colors.text.secondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    likeCount: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    likedText: {
      color: colors.error,
    },
    count: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    date: {
      ...typography.caption,
      color: colors.text.tertiary,
    },
  }), [colors]);

  const handleLikePress = () => {
    if (isOwner) return;
    if (collection.isLiked) {
      unlikeMutation.mutate(collection.id);
    } else {
      likeMutation.mutate(collection.id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {collection.name}
          </Text>
          {collection.isPrivate && (
            <Ionicons name="lock-closed" size={16} color={colors.text.secondary} />
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {collection.description || 'No description'}
        </Text>
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Text style={styles.count}>
              {collection.postCount} {collection.postCount === 1 ? 'Post' : 'Posts'}
            </Text>
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={isOwner ? undefined : handleLikePress}
              disabled={isOwner}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={collection.isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={collection.isLiked ? colors.error : colors.text.secondary} 
              />
              <Text style={[
                styles.likeCount, 
                collection.isLiked && styles.likedText
              ]}>
                {collection.likeCount || 0}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.date}>
            {new Date(collection.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
