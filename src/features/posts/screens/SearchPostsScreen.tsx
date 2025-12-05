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

import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useInfiniteSearchPosts } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';

const PAGE_SIZE = 20;

export const SearchPostsScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const shouldSearch = debouncedSearch.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
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
        hint: {
          ...typography.caption,
          color: colors.text.secondary,
          marginTop: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
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
        loadingMore: {
          paddingVertical: spacing.md,
        },
      }),
    [colors, insets.top],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteSearchPosts(
    {
      q: shouldSearch ? debouncedSearch : '',
      pageSize: PAGE_SIZE,
    },
    {
      staleTime: 0,
      enabled: shouldSearch,
    },
  );

  const posts = shouldSearch ? data?.pages.flat() ?? [] : [];
  const isInitialLoading = shouldSearch && isLoading && posts.length === 0;
  const isEmpty = shouldSearch && !isInitialLoading && posts.length === 0;

  const handleEndReached = () => {
    if (shouldSearch && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!shouldSearch || !isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
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
              placeholder={'Ara, "tam ifade" ya da -haric'}
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
        <Text style={styles.hint}>{'Kelime, "tam ifade" ve -cikarma desteklenir.'}</Text>
      </View>

      {!shouldSearch ? (
        <View style={styles.emptyContent} />
      ) : isInitialLoading ? (
        <View style={styles.emptyContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} />}
          contentContainerStyle={posts.length === 0 ? styles.emptyContent : styles.listContent}
          ListEmptyComponent={
            isEmpty ? (
              <View style={styles.emptyContent}>
                <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>Aramana uygun gonderi bulunamadi.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};
