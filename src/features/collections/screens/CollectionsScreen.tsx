import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, StyleProp, ViewStyle, Modal, Pressable, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyCollectionsQuery, usePublicCollectionsQuery, useDeleteCollectionMutation } from '../data/useCollectionsQuery';
import { CollectionCard } from '../ui/CollectionCard';
import { spacing, typography, borderRadius } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { CollectionModal } from '../ui/CreateCollectionModal';
import { Ionicons } from '@expo/vector-icons';
import { CollectionsScreenNavigationProp } from '../navigation/types';
import { Collection } from '../domain/types';

type TabType = 'my' | 'discover';
interface CollectionsScreenProps {
  onScroll?: any;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const CollectionsScreen = ({ onScroll, contentContainerStyle }: CollectionsScreenProps) => {
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | undefined>(undefined);

  // Queries
  const myCollectionsQuery = useMyCollectionsQuery();
  const publicCollectionsQuery = usePublicCollectionsQuery();
  const deleteCollectionMutation = useDeleteCollectionMutation();

  const activeQuery = activeTab === 'my' ? myCollectionsQuery : publicCollectionsQuery;
  const { data, isLoading, error, refetch, isRefetching } = activeQuery;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
      alignItems: 'center',
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTab: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
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
      paddingHorizontal: 0,
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
    sheetOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      gap: spacing.sm,
      backgroundColor: colors.surface,
    },
    sheetItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    sheetIcon: {
      marginRight: spacing.sm,
    },
    sheetText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
  }), [colors]);

  const handleEdit = () => {
    if (!menuCollection) return;
    setEditingCollection(menuCollection);
    setMenuCollection(null);
    setIsCollectionModalVisible(true);
  };

  const handleDelete = () => {
    if (!menuCollection) return;
    const collectionId = menuCollection.id;
    const collectionName = menuCollection.name;
    setMenuCollection(null);

    Alert.alert(
      'Koleksiyonu Sil',
      `"${collectionName}" koleksiyonunu silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteCollectionMutation.mutate({ id: collectionId });
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!menuCollection) return;
    setMenuCollection(null);
    try {
      await Share.share({
        message: `Check out this collection: ${menuCollection.name}`,
        // url: `https://captionarsiv.com/collections/${menuCollection.id}`, // Example URL
      });
    } catch (error) {
      // Ignore
    }
  };

  const handleCreate = () => {
    setEditingCollection(undefined);
    setIsCollectionModalVisible(true);
  };

  const paddingTop = useMemo(() => {
    const flat = StyleSheet.flatten(contentContainerStyle) as ViewStyle;
    return (flat?.paddingTop as number) ?? 0;
  }, [contentContainerStyle]);

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
        onPress={() => setActiveTab('discover')}
      >
        <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Keşif</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'my' && styles.activeTab]}
        onPress={() => setActiveTab('my')}
      >
        <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>Koleksiyonun</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (!isAuthenticated && activeTab === 'my') {
      return (
        <View style={[styles.container, { paddingTop }]}>
          {renderTabs()}
          <View style={styles.centerContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.message}>Koleksiyonlarınızı görmek için giriş yapın</Text>
          </View>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={[styles.container, { paddingTop }]}>
          {renderTabs()}
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.container, { paddingTop }]}>
          {renderTabs()}
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Koleksiyonlar yüklenemedi</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const collections = data?.data || [];

    return (
      <Animated.FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderTabs()}
        columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <CollectionCard
            collection={item}
            onPress={() => navigation.navigate('CollectionDetail', { id: item.id, name: item.name })}
            onMenuPress={() => setMenuCollection(item)}
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
            onPress={handleCreate}
          >
            <Ionicons name="add" size={32} color={colors.surface} />
          </TouchableOpacity>
        </View>
      )}

      <CollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        collection={editingCollection}
      />

      <Modal
        visible={!!menuCollection}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuCollection(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setMenuCollection(null)}>
          <Pressable style={styles.sheetContainer} onPress={() => {}}>
            {menuCollection?.userId === user?.id && (
              <>
                <TouchableOpacity style={styles.sheetItem} onPress={handleEdit}>
                  <Ionicons name="pencil-outline" size={22} color={colors.text.primary} style={styles.sheetIcon} />
                  <Text style={styles.sheetText}>Koleksiyonu Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetItem} onPress={() => {
                   setMenuCollection(null);
                   Alert.alert('Yakında', 'Kapak fotoğrafı özelliği yakında eklenecek.');
                }}>
                  <Ionicons name="image-outline" size={22} color={colors.text.primary} style={styles.sheetIcon} />
                  <Text style={styles.sheetText}>Koleksiyona Kapak Ata</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={styles.sheetItem} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={colors.text.primary} style={styles.sheetIcon} />
              <Text style={styles.sheetText}>Paylaş</Text>
            </TouchableOpacity>

            {menuCollection?.userId === user?.id && (
              <TouchableOpacity style={styles.sheetItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color={colors.error} style={styles.sheetIcon} />
                <Text style={[styles.sheetText, { color: colors.error }]}>Sil</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
