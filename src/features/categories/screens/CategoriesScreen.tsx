import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useFollowCategoryMutation,
  useUnfollowCategoryMutation,
} from '../data/useCategoriesQuery';
import { useCategoryPermissions } from '../domain/useCategoryPermissions';
import type { Category, CreateCategoryRequest } from '../domain/types';
import { CategoryModal } from '../ui/CategoryModal';

import { navigate } from '@/navigation/navigationRef';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';

export const CategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: categories, isLoading, refetch, isRefetching } = useCategoriesQuery();
  const { canCreate, canDelete, canUpdate } = useCategoryPermissions();

  const deleteMutation = useDeleteCategoryMutation();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const followMutation = useFollowCategoryMutation();
  const unfollowMutation = useUnfollowCategoryMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        },
        title: {
          ...typography.h2,
          color: colors.text.primary,
        },
        createButton: {
          backgroundColor: colors.primary,
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        listContent: {
          padding: spacing.md,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        cardContent: {
          flex: 1,
        },
        cardTitle: {
          ...typography.h3,
          color: colors.text.primary,
          marginBottom: 4,
        },
        cardDescription: {
          ...typography.body,
          color: colors.text.secondary,
          marginBottom: 8,
        },
        statsContainer: {
          flexDirection: 'row',
        },
        statsText: {
          ...typography.caption,
          color: colors.text.tertiary,
        },
        actions: {
          flexDirection: 'row',
          marginLeft: spacing.sm,
          alignItems: 'center',
        },
        actionButton: {
          padding: spacing.xs,
          marginLeft: spacing.xs,
        },
        center: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        },
        emptyText: {
          ...typography.body,
          color: colors.text.secondary,
        },
      }),
    [colors],
  );

  const handleDelete = (id: string) => {
    Alert.alert('Kategoriyi Sil', 'Bu kategoriyi silmek istediğine emin misin?', [
      { text: 'Iptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleSubmit = async (data: CreateCategoryRequest) => {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({ id: selectedCategory.id, data });
        setModalVisible(false);
        return selectedCategory.id;
      } else {
        const created = await createMutation.mutateAsync(data);
        setModalVisible(false);
        return created.id;
      }
    } catch (error) {
      Alert.alert('Hata', 'Islem gerceklestirilemedi.');
      throw error;
    }
  };

  const handleFollowToggle = (category: Category) => {
    if (category.isFollowing) {
      unfollowMutation.mutate(category.id);
    } else {
      followMutation.mutate(category.id);
    }
  };

  const renderItem = ({ item }: { item: Category }) => {
    const hasIcon = !!item.iconUrl;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigate('CategoryPosts', {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
      >
        {hasIcon && (
          <View>
            <Image
              source={{ uri: resolveMediaUrl(item.iconUrl) ?? '' }}
              style={{
                width: 48,
                height: 48,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surfaceHighlight,
              }}
            />
          </View>
        )}
        <View style={[styles.cardContent, hasIcon && { marginLeft: spacing.sm }]}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>{item.postCount || 0} gonderi</Text>
            <Text style={[styles.statsText, { marginLeft: 8 }]}>{item.followerCount || 0} takipci</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleFollowToggle(item);
            }}
            disabled={followMutation.isPending || unfollowMutation.isPending}
          >
            <Ionicons
              name={item.isFollowing ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isFollowing ? colors.error : colors.text.secondary}
            />
          </TouchableOpacity>

          {(canUpdate || canDelete) && (
            <>
              {canUpdate && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <Ionicons name="pencil" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {canUpdate && (
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.surfaceHighlight }]} 
              onPress={() => navigate('CategoryReorder' as any)}
            >
              <Ionicons name="swap-vertical" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
          {canCreate && (
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Kategori bulunamadi</Text>
            </View>
          }
        />
      )}

      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={selectedCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </View>
  );
};
