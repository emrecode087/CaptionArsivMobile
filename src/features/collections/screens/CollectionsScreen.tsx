import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyCollectionsQuery } from '../data/useCollectionsQuery';
import { CollectionCard } from '../ui/CollectionCard';
import { colors, spacing, typography } from '../../../core/theme/tokens';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { CollectionModal } from '../ui/CreateCollectionModal';
import { Ionicons } from '@expo/vector-icons';
import { CollectionsScreenNavigationProp } from '../navigation/types';

export const CollectionsScreen = () => {
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, error, refetch } = useMyCollectionsQuery();
  const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.text.tertiary} />
        <Text style={styles.message}>Please login to view your collections</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load collections</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const collections = data?.data || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollectionCard
            collection={item}
            onPress={() => navigation.navigate('CollectionDetail', { id: item.id, name: item.name })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
            <Text style={styles.emptySubText}>Create your first collection!</Text>
          </View>
        }
      />
      
      {/* FAB for creating new collection */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Ionicons name="add" size={32} color={colors.surface} />
      </TouchableOpacity>

      <CollectionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
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
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 64, // Space for FAB
  },
  message: {
    ...typography.h4,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
  },
  retryText: {
    color: colors.surface,
    ...typography.bodyBold,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
