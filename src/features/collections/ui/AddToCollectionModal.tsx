import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useMyCollectionsQuery,
  useCreateCollectionMutation,
  useAddPostToCollectionMutation,
  useRemovePostFromCollectionMutation,
} from '../data/useCollectionsQuery';
import { spacing, borderRadius, typography } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';

interface AddToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  onMembershipChange?: (collectionIds: string[]) => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ visible, onClose, postId, onMembershipChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const { colors } = useTheme();
  
  const { data: collectionsData, isLoading: isLoadingCollections } = useMyCollectionsQuery({ includePosts: true });
  const createCollectionMutation = useCreateCollectionMutation();
  const addPostMutation = useAddPostToCollectionMutation();
  const removePostMutation = useRemovePostFromCollectionMutation();

  const savedCollectionIds = useMemo(() => {
    const list = collectionsData?.data ?? [];
    return list.filter((col) => col.posts?.some((p) => p.postId === postId)).map((col) => col.id);
  }, [collectionsData?.data, postId]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)', // Overlay color
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      padding: spacing.md,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.h3,
      color: colors.text.primary,
    },
    list: {
      maxHeight: 300,
    },
    collectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    collectionIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    collectionName: {
      ...typography.bodyBold,
      color: colors.text.primary,
    },
    collectionCount: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text.secondary,
      padding: spacing.md,
    },
    newButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    newButtonText: {
      ...typography.bodyBold,
      color: colors.surface,
      marginLeft: spacing.sm,
    },
    createContainer: {
      marginTop: spacing.md,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      ...typography.body,
      color: colors.text.primary,
      backgroundColor: colors.background,
    },
    createActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    button: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    createButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      color: colors.text.primary,
      ...typography.bodyBold,
    },
    createButtonText: {
      color: colors.surface,
      ...typography.bodyBold,
    },
  }), [colors]);

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    createCollectionMutation.mutate(
      { name: newCollectionName, description: '', isPrivate: true },
      {
        onSuccess: (data) => {
          if (data.data) {
            addPostMutation.mutate(
              { id: data.data.id, data: { postId } },
              {
                onSuccess: () => {
                  onMembershipChange?.([...savedCollectionIds, data.data!.id]);
                },
              },
            );
            setNewCollectionName('');
            setIsCreating(false);
            onClose();
          }
        },
      }
    );
  };

  const toggleCollection = (collectionId: string, isSaved: boolean) => {
    if (isSaved) {
      removePostMutation.mutate(
        { id: collectionId, postId },
        {
          onSuccess: () => {
            onMembershipChange?.(savedCollectionIds.filter((id) => id !== collectionId));
          },
        },
      );
    } else {
      addPostMutation.mutate(
        { id: collectionId, data: { postId } },
        {
          onSuccess: () => {
            onMembershipChange?.([...savedCollectionIds, collectionId]);
          },
        },
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {isLoadingCollections ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <FlatList
                data={collectionsData?.data || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.collectionItem}
                    onPress={() => toggleCollection(item.id, savedCollectionIds.includes(item.id))}
                  >
                    <View style={styles.collectionIcon}>
                      <Ionicons name="albums-outline" size={24} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.collectionName}>{item.name}</Text>
                      <Text style={styles.collectionCount}>{item.postCount} posts</Text>
                    </View>
                    <Ionicons
                      name={savedCollectionIds.includes(item.id) ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color={savedCollectionIds.includes(item.id) ? '#1DA1F2' : colors.text.tertiary}
                      style={{ marginLeft: 'auto' }}
                    />
                  </TouchableOpacity>
                )}
                style={styles.list}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No collections found</Text>
                }
              />

              {isCreating ? (
                <View style={styles.createContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Collection Name"
                    placeholderTextColor={colors.text.tertiary}
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    autoFocus
                  />
                  <View style={styles.createActions}>
                    <TouchableOpacity 
                      style={[styles.button, styles.cancelButton]} 
                      onPress={() => setIsCreating(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.createButton]} 
                      onPress={handleCreateCollection}
                      disabled={createCollectionMutation.isPending}
                    >
                      {createCollectionMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : (
                        <Text style={styles.createButtonText}>Create</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.newButton}
                  onPress={() => setIsCreating(true)}
                >
                  <Ionicons name="add" size={24} color={colors.surface} />
                  <Text style={styles.newButtonText}>New Collection</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
