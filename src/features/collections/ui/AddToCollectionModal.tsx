import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMyCollectionsQuery, useCreateCollectionMutation, useAddPostToCollectionMutation } from '../data/useCollectionsQuery';
import { colors, spacing, borderRadius, typography } from '../../../core/theme/tokens';

interface AddToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ visible, onClose, postId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  const { data: collectionsData, isLoading: isLoadingCollections } = useMyCollectionsQuery();
  const createCollectionMutation = useCreateCollectionMutation();
  const addPostMutation = useAddPostToCollectionMutation();

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    createCollectionMutation.mutate(
      { name: newCollectionName, description: '', isPrivate: true },
      {
        onSuccess: (data) => {
          // After creating, add the post to the new collection
          if (data.data) {
            addPostMutation.mutate({ id: data.data.id, data: { postId } });
            setNewCollectionName('');
            setIsCreating(false);
            onClose();
          }
        },
      }
    );
  };

  const handleAddToCollection = (collectionId: string) => {
    addPostMutation.mutate(
      { id: collectionId, data: { postId } },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
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
                    onPress={() => handleAddToCollection(item.id)}
                  >
                    <View style={styles.collectionIcon}>
                      <Ionicons name="albums-outline" size={24} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.collectionName}>{item.name}</Text>
                      <Text style={styles.collectionCount}>{item.postCount} posts</Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color={colors.text.tertiary} style={{ marginLeft: 'auto' }} />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
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
    borderBottomColor: colors.divider,
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
});
