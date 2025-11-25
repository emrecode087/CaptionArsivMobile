import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyCollectionsQuery, usePublicCollectionsQuery } from '../data/useCollectionsQuery';
import { CollectionCard } from '../ui/CollectionCard';
import { spacing, typography, borderRadius } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { CollectionModal } from '../ui/CreateCollectionModal';
import { Ionicons } from '@expo/vector-icons';
import { CollectionsScreenNavigationProp } from '../navigation/types';

type TabType = 'my' | 'discover';
interface CollectionsScreenProps {
  onScroll?: any;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const CollectionsScreen = ({ onScroll, contentContainerStyle }: CollectionsScreenProps) => {
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Queries
  const myCollectionsQuery = useMyCollectionsQuery();
  const publicCollectionsQuery = usePublicCollectionsQuery();

  const activeQuery = activeTab === 'my' ? myCollectionsQuery : publicCollectionsQuery;
  const { data, isLoading, error, refetch, isRefetching } = activeQuery;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      padding: spacing.sm,
      backgroundColor: colors.surface,
      marginBottom: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...typography.body2,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.primary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
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
    fabContainer: {
      position: 'absolute',
      right: spacing.xl,
      // bottom will be set dynamically
      zIndex: 100,
    },
    fab: {
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
  }), [colors]);
  const renderContent = () => {
    if (!isAuthenticated && activeTab === 'my') {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.message}>Koleksiyonlarınızı görmek için giriş yapın</Text>
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
          <Text style={styles.errorText}>Koleksiyonlar yüklenemedi</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const collections = data?.data || [];

    return (
      <Animated.FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollectionCard
            collection={item}
            onPress={() => navigation.navigate('CollectionDetail', { id: item.id, name: item.name })}
          />
        )}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'my' ? 'Henüz koleksiyonunuz yok' : 'Koleksiyon bulunamadı'}
            </Text>
            {activeTab === 'my' && (
              <Text style={styles.emptySubText}>İlk koleksiyonunuzu oluşturun!</Text>
            )}
          </View>
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>Koleksiyonlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Keşfet</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
      
      {/* FAB only visible on My Collections tab */}
      {activeTab === 'my' && isAuthenticated && (
        <View 
          style={[
            styles.fabContainer,
            {
              bottom: insets.bottom + 90, // Fixed position above banner
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Ionicons name="add" size={32} color={colors.surface} />
          </TouchableOpacity>
        </View>
      )}

      <CollectionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </View>
  );
};
