import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useInfiniteSearchPosts } from '@/features/posts/data/usePostsQuery';
import { usePublicCollectionsQuery } from '@/features/collections/data/useCollectionsQuery';
import { useCategoriesQuery } from '@/features/categories/data/useCategoriesQuery';
import { PostCard } from '@/features/posts/ui/PostCard';
import { CollectionCard } from '@/features/collections/ui/CollectionCard';

const PAGE_SIZE = 20;

type SearchTab = 'posts' | 'collections' | 'categories';

export const SearchPostsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('posts');
  const shouldSearch = debouncedSearch.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim().toLocaleLowerCase('tr-TR')), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingTop: insets.top,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerContent: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
        },
        searchBar: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surfaceHighlight,
          borderRadius: 12,
          paddingHorizontal: spacing.sm,
          paddingVertical: Platform.OS === 'ios' ? 10 : 8,
          gap: spacing.xs,
          borderWidth: 1,
          borderColor: colors.border,
        },
        input: {
          flex: 1,
          ...typography.body,
          color: colors.text.primary,
          paddingVertical: 0,
        },
        tabsContainer: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tab: {
          flex: 1,
          alignItems: 'center',
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
          fontWeight: '500',
        },
        activeTabText: {
          color: colors.primary,
          fontWeight: '600',
        },
        listContent: {
          paddingBottom: spacing.xl,
        },
        emptyContent: {
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
        },
        emptyText: {
          ...typography.body,
          color: colors.text.secondary,
          textAlign: 'center',
          marginTop: spacing.sm,
        },
        hint: {
          ...typography.caption,
          color: colors.text.secondary,
          marginTop: spacing.xs,
        },
        loadingMore: {
          paddingVertical: spacing.md,
        },
        categoryCard: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          backgroundColor: colors.surface,
          marginBottom: 1,
        },
        categoryName: {
          ...typography.body,
          color: colors.text.primary,
          flex: 1,
        },
      }),
    [colors, insets.top],
  );

  // Posts Query
  const postsQuery = useInfiniteSearchPosts(
    {
      q: shouldSearch ? debouncedSearch : '',
      pageSize: PAGE_SIZE,
    },
    {
      staleTime: 0,
      enabled: shouldSearch && activeTab === 'posts',
    }
  );

  // Collections Query
  const collectionsQuery = usePublicCollectionsQuery(
    { search: shouldSearch ? debouncedSearch : '' },
    { enabled: shouldSearch && activeTab === 'collections' }
  );

  // Categories Query
  const categoriesQuery = useCategoriesQuery(
    { search: shouldSearch ? debouncedSearch : '' },
    { enabled: shouldSearch && activeTab === 'categories' }
  );

  const renderTab = (tab: SearchTab, label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (!shouldSearch) {
      return (
        <View style={styles.emptyContent}>
          <Ionicons name="search" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Aramak istediğiniz kelimeyi yazın</Text>
        </View>
      );
    }

    if (activeTab === 'posts') {
      const posts = postsQuery.data?.pages.flat() ?? [];
      const isInitialLoading = postsQuery.isLoading && posts.length === 0;
      const isEmpty = !isInitialLoading && posts.length === 0;

      if (isInitialLoading) {
        return (
          <View style={styles.emptyContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      }

      if (postsQuery.isError) {
        return (
          <View style={styles.emptyContent}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={styles.emptyText}>Bir hata oluştu</Text>
            <TouchableOpacity onPress={() => postsQuery.refetch()} style={{ marginTop: spacing.md }}>
              <Text style={{ color: colors.primary, ...typography.button }}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={isEmpty ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>Aramana uygun gönderi bulunamadı.</Text>
            </View>
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={postsQuery.isRefetching}
              onRefresh={postsQuery.refetch}
              tintColor={colors.primary}
            />
          }
          onEndReached={() => {
            if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
              postsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.6}
          keyboardShouldPersistTaps="handled"
        />
      );
    }

    if (activeTab === 'collections') {
      const collections = collectionsQuery.data?.data ?? [];
      const isLoading = collectionsQuery.isLoading;
      const isEmpty = !isLoading && collections.length === 0;

      if (isLoading) {
        return (
          <View style={styles.emptyContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      }

      return (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionCard 
              collection={item} 
              onPress={() => navigation.navigate('CollectionDetail', { id: item.id })} 
            />
          )}
          contentContainerStyle={isEmpty ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Ionicons name="albums-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>Aramana uygun koleksiyon bulunamadı.</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      );
    }

    if (activeTab === 'categories') {
      const categories = categoriesQuery.data ?? [];
      const isLoading = categoriesQuery.isLoading;
      const isEmpty = !isLoading && categories.length === 0;

      if (isLoading) {
        return (
          <View style={styles.emptyContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      }

      return (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('CategoryPosts', { categoryId: item.id, categoryName: item.name })}
            >
              <Ionicons name="folder-outline" size={24} color={colors.primary} style={{ marginRight: spacing.md }} />
              <Text style={styles.categoryName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
          contentContainerStyle={isEmpty ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContent}>
              <Ionicons name="folder-open-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>Aramana uygun kategori bulunamadı.</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder={'Ara'}
              placeholderTextColor={colors.text.secondary}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => {
                setDebouncedSearch(searchInput.trim());
                Keyboard.dismiss();
              }}
              style={styles.input}
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => setSearchInput('')} style={{ padding: spacing.xs }}>
                <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.tabsContainer}>
          {renderTab('posts', 'Gönderiler')}
          {renderTab('collections', 'Koleksiyonlar')}
          {renderTab('categories', 'Kategoriler')}
        </View>
      </View>

      {renderContent()}
    </View>
  );
};
