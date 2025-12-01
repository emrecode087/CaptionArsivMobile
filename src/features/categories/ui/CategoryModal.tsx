import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import type { CreateCategoryRequest, Category } from '../domain/types';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  initialData?: Category | null;
  isLoading?: boolean;
}

export const CategoryModal = ({ visible, onClose, onSubmit, initialData, isLoading }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
    }
  }, [visible, initialData]);

  const styles = useMemo(() => StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      padding: spacing.lg,
      minHeight: '50%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h3,
      color: colors.text.primary,
    },
    form: {
      gap: spacing.md,
    },
    inputGroup: {
      gap: spacing.xs,
    },
    label: {
      ...typography.bodyBold,
      color: colors.text.secondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    disabledButton: {
      opacity: 0.6,
    },
    submitButtonText: {
      ...typography.bodyBold,
      color: colors.text.inverse,
    },
  }), [colors]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name, description });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori Adı</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Örn: Spor"
                placeholderTextColor={colors.text.tertiary}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Kategori açıklaması..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (!name.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {initialData ? 'Güncelle' : 'Oluştur'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
