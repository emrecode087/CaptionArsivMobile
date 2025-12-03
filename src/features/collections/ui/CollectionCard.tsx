import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Collection } from '../domain/types';
import { spacing, borderRadius, typography } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLikeCollectionMutation, useUnlikeCollectionMutation } from '../data/useCollectionsQuery';
import { useAuthStore } from '../../auth/stores/useAuthStore';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
  onMenuPress?: () => void;
  variant?: 'default' | 'discover';
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress, onMenuPress, variant = 'default' }) => {
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const likeMutation = useLikeCollectionMutation();
  const unlikeMutation = useUnlikeCollectionMutation();

  const isOwner = user?.id === collection.userId;
  // Calculate width based on 2 columns with padding
  // Screen padding: spacing.md (16) * 2 = 32
  // Gap between columns: spacing.md (16)
  // Total available width = SCREEN_WIDTH - 48
  const cardWidth = (SCREEN_WIDTH - (spacing.md * 3)) / 2;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: cardWidth,
      height: cardWidth * 1.2, // Slightly rectangular
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceHighlight,
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
    },
    collageContainer: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    collageItem: {
      width: '50%',
      height: '50%',
      borderWidth: 0.5,
      borderColor: colors.surface,
    },
    collageImage: {
      width: '100%',
      height: '100%',
    },
    placeholderItem: {
      width: '50%',
      height: '50%',
      backgroundColor: colors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: colors.surface,
    },
    infoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.6)', // Dark gradient-like overlay
    },
    title: {
      ...typography.bodyBold,
      color: '#FFFFFF',
      fontSize: 14,
      marginBottom: 2,
    },
    count: {
      ...typography.caption,
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
    },
    menuButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      padding: spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: borderRadius.full,
    },
    privateIcon: {
      marginLeft: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    }
  }), [colors, cardWidth]);

  // Get up to 4 thumbnails from posts
  const thumbnails = useMemo(() => {
    const thumbs: string[] = [];
    if (collection.posts && collection.posts.length > 0) {
      collection.posts.slice(0, 4).forEach(post => {
        if (post.thumbnailUrl) {
          thumbs.push(post.thumbnailUrl);
        } else if (post.embedHtml) {
          const match = post.embedHtml.match(/<img[^>]+src="([^">]+)"/);
          if (match) thumbs.push(match[1]);
        }
      });
    }
    return thumbs;
  }, [collection.posts]);

  const renderCollage = () => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      if (i < thumbnails.length) {
        items.push(
          <View key={i} style={styles.collageItem}>
            <Image 
              source={{ uri: thumbnails[i] }} 
              style={styles.collageImage} 
              resizeMode="cover" 
            />
          </View>
        );
      } else {
        items.push(
          <View key={i} style={styles.placeholderItem}>
            <Ionicons name="image-outline" size={20} color={colors.text.tertiary} />
          </View>
        );
      }
    }
    return items;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.collageContainer}>
        {renderCollage()}
      </View>

      <View style={styles.infoOverlay}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{collection.name}</Text>
          {collection.isPrivate && (
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" style={styles.privateIcon} />
          )}
        </View>
        <Text style={styles.count}>{collection.postCount} video</Text>
      </View>

      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
