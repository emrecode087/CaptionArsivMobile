import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useCategoriesQuery, useDeleteCategoryMutation, useCreateCategoryMutation, useUpdateCategoryMutation } from '../data/useCategoriesQuery';
import { useCategoryPermissions } from '../domain/useCategoryPermissions';
import type { Category, CreateCategoryRequest } from '../domain/types';
import { CategoryModal } from '../ui/CategoryModal';

export const CategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading, refetch, isRefetching } = useCategoriesQuery();
  const { canCreate, canDelete, canUpdate } = useCategoryPermissions();
  
  const deleteMutation = useDeleteCategoryMutation();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Kategoriyi Sil',
      'Bu kategoriyi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: () => deleteMutation.mutate(id) 
        },
      ]
    );
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
      } else {
        await createMutation.mutateAsync(data);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{item.postCount || 0} gönderi</Text>
        </View>
      </View>
      
      {(canUpdate || canDelete) && (
        <View style={styles.actions}>
          {canUpdate && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        {canCreate && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Kategori bulunamadı</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
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
});
