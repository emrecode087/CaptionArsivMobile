import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import type { CreateCategoryRequest, Category } from '../domain/types';
import { useUploadCategoryIconMutation } from '../data/useCategoriesQuery';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';

type UploadFile = { uri: string; name?: string; type?: string };

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<string>;
  initialData?: Category | null;
  isLoading?: boolean;
}

export const CategoryModal = ({ visible, onClose, onSubmit, initialData, isLoading }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<UploadFile | null>(null);
  const uploadMutation = useUploadCategoryIconMutation();
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setIconUrl(initialData?.iconUrl ?? null);
      setLocalPreview(null);
      setUploadError(null);
      setPendingUploadFile(null);
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
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconPreview: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    iconPlaceholderText: {
      ...typography.subtitle1,
      color: colors.text.secondary,
    },
    iconButtons: {
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    ghostButtonText: {
      ...typography.bodyBold,
      color: colors.error,
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

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const categoryId = await onSubmit({ name, description });

    if (pendingUploadFile && !initialData) {
      try {
        const updated = await uploadMutation.mutateAsync({ categoryId, ...pendingUploadFile });
        setIconUrl(updated.iconUrl ?? null);
        setLocalPreview(null);
        setPendingUploadFile(null);
      } catch (error: any) {
        setUploadError(error?.message ?? 'Ikon yuklenemedi');
      }
    }

    // Kategori update/create sonrası modal açıkken de görüntüyü senkron tutmak için
    if (!pendingUploadFile && initialData?.iconUrl) {
      setIconUrl(initialData.iconUrl);
    }
  };

  const handlePickIcon = async () => {
    setUploadError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setUploadError('Galeri izni gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.uri) {
      setUploadError('Gecersiz gorsel secimi.');
      return;
    }

    setLocalPreview(asset.uri);
    const fileName = asset.fileName ?? asset.uri.split('/').pop() ?? 'category-icon.jpg';

    const file: UploadFile = { uri: asset.uri, name: fileName, type: asset.mimeType ?? 'image/jpeg' };

    if (initialData?.id) {
      try {
        const updated = await uploadMutation.mutateAsync({ categoryId: initialData.id, ...file });
        setIconUrl(updated.iconUrl ?? null);
        setLocalPreview(null);
      } catch (error: any) {
        setUploadError(error?.message ?? 'Ikon yuklenemedi');
        setLocalPreview(null);
      }
    } else {
      setPendingUploadFile(file);
    }
  };

  const handleClearIcon = () => {
    setIconUrl(null);
    setLocalPreview(null);
    setPendingUploadFile(null);
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
              {initialData ? 'Kategoriyi Duzenle' : 'Yeni Kategori'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori ikonu</Text>
              <View style={styles.iconRow}>
                <View style={styles.iconPreview}>
                  {localPreview || iconUrl ? (
                    <Image source={{ uri: localPreview ?? resolveMediaUrl(iconUrl) ?? '' }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={styles.iconPlaceholderText}>?</Text>
                  )}
                </View>
                <View style={styles.iconButtons}>
                  <TouchableOpacity onPress={handlePickIcon} disabled={isLoading || uploadMutation.isPending}>
                    <Text style={[styles.submitButtonText, { color: colors.primary }]}>
                      {iconUrl || localPreview ? 'Ikonu degistir' : 'Ikon ekle'}
                    </Text>
                  </TouchableOpacity>
                  {(iconUrl || localPreview) && (
                    <TouchableOpacity onPress={handleClearIcon} disabled={isLoading || uploadMutation.isPending}>
                      <Text style={styles.ghostButtonText}>Kaldir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {uploadError && <Text style={{ ...typography.caption, color: colors.error }}>{uploadError}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori Adi</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Orn: Spor"
                placeholderTextColor={colors.text.tertiary}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aciklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Kategori aciklamasi..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, (!name.trim() || isLoading || uploadMutation.isPending) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!name.trim() || isLoading || uploadMutation.isPending}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {initialData ? 'Guncelle' : 'Olustur'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
