import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { CustomHeader } from '@/core/ui/CustomHeader';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';
import { useRelatedTagsQuery, useTagsQuery } from '../data/useTagsQuery';
import { useFollowedTagsQuery, useFollowTagMutation, useUnfollowTagMutation } from '../hooks/useTagFollow';

type SortType = 'date' | 'likes';

export const TagPostsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { tag } = route.params; // tag name or id
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const [activeTab, setActiveTab] = useState<SortType>('likes'); // Default to Hot (Popüler)

  // Resolve Tag ID and Name
  const { data: allTags } = useTagsQuery();
  const currentTag = useMemo(() => {
    if (!allTags) return null;
    return allTags.find(t => t.name === tag || t.id === tag);
  }, [allTags, tag]);

  const tagName = currentTag?.name || tag;
  const tagId = currentTag?.id || (tag.includes('-') ? tag : null);

  // Follow Logic
  const { data: followedTags } = useFollowedTagsQuery();
  const isFollowing = useMemo(() => {
    return followedTags?.some(t => t.id === tagId) ?? false;
  }, [followedTags, tagId]);

  const { mutate: follow, isPending: isFollowPending } = useFollowTagMutation();
  const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollowTagMutation();

  const handleFollowPress = () => {
    if (!tagId) return;
    if (isFollowing) {
      unfollow(tagId);
    } else {
      follow(tagId);
    }
  };
  
  // Fetch posts based on tag and feed type
  const feedType = activeTab === 'likes' ? 'Popular' : 'New';
  
  const { data: posts, isLoading, refetch } = usePostsQuery({
    tag: tag,
    feedType,
  });

  // Fetch related tags
  const { data: relatedTagsData } = useRelatedTagsQuery(tag);
  const relatedTags = useMemo(() => {
    return Array.isArray(relatedTagsData) ? relatedTagsData : [];
  }, [relatedTagsData]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.surface,
      paddingBottom: spacing.sm,
    },
    relatedTagsContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    relatedTag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    relatedTagText: {
      ...typography.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    followButtonContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    followButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 4,
      width: '100%',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: spacing.sm,
    },
    followingButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followButtonText: {
      ...typography.button,
      fontSize: 16,
      color: colors.text.inverse,
      fontWeight: '700',
    },
    followingButtonText: {
      color: colors.text.primary,
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...typography.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    activeTabText: {
      color: colors.primary,
    },
    listContent: {
      paddingBottom: 100,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 60,
      paddingHorizontal: spacing.xl,
    },
    emptyText: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  }), [colors]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Related Tags */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.relatedTagsContainer}
      >
        {relatedTags.map(t => (
          <TouchableOpacity 
            key={t.id} 
            style={styles.relatedTag}
            onPress={() => navigation.push('TagPosts', { tag: t.name })}
          >
            <Text style={styles.relatedTagText}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Follow Button */}
      <View style={styles.followButtonContainer}>
        <TouchableOpacity 
          style={[styles.followButton, isFollowing && styles.followingButton]} 
          onPress={handleFollowPress}
          disabled={isFollowPending || isUnfollowPending}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]} 
          onPress={() => setActiveTab('likes')}
        >
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>Popüler</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'date' && styles.activeTab]} 
          onPress={() => setActiveTab('date')}
        >
          <Text style={[styles.tabText, activeTab === 'date' && styles.activeTabText]}>Yeni</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Bu etikette henüz gönderi yok.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title={tagName} showBack />
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
    </View>
  );
};
