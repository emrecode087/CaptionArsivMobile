import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateCollectionMutation, useUpdateCollectionMutation } from '../data/useCollectionsQuery';
import { spacing, borderRadius, typography } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { Collection } from '../domain/types';

interface CollectionModalProps {
  visible: boolean;
  onClose: () => void;
  collection?: Collection; // If provided, we are in edit mode
}

export const CollectionModal: React.FC<CollectionModalProps> = ({ visible, onClose, collection }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const { colors } = useTheme();
  
  const createCollectionMutation = useCreateCollectionMutation();
  const updateCollectionMutation = useUpdateCollectionMutation();

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
      setIsPrivate(collection.isPrivate);
    } else {
      setName('');
      setDescription('');
      setIsPrivate(true);
    }
  }, [collection, visible]);

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
    form: {
      gap: spacing.sm,
    },
    label: {
      ...typography.bodyBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      ...typography.body,
      color: colors.text.primary,
      backgroundColor: colors.background,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.sm,
    },
    checkboxLabel: {
      ...typography.body,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    createButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    createButtonText: {
      ...typography.bodyBold,
      color: colors.surface,
    },
  }), [colors]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    if (collection) {
      updateCollectionMutation.mutate(
        { id: collection.id, data: { name, description, isPrivate } },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createCollectionMutation.mutate(
        { name, description, isPrivate },
        {
          onSuccess: () => {
            setName('');
            setDescription('');
            setIsPrivate(true);
            onClose();
          },
        }
      );
    }
  };

  const isPending = createCollectionMutation.isPending || updateCollectionMutation.isPending;
  const title = collection ? 'Edit Collection' : 'New Collection';
  const buttonText = collection ? 'Update Collection' : 'Create Collection';

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
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Collection Name"
              placeholderTextColor={colors.text.tertiary}
              value={name}
              onChangeText={setName}
              autoFocus={!collection}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <Ionicons 
                name={isPrivate ? "checkbox" : "square-outline"} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.checkboxLabel}>Private Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.createButton} 
              onPress={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={styles.createButtonText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
