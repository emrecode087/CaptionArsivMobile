import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography, borderRadius } from '../../../core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useCreatePostMutation } from '../data/usePostsQuery';
import { useCategoriesQuery } from '../../categories/data/useCategoriesQuery';
import { Category } from '../../categories/domain/types';

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const createPostMutation = useCreatePostMutation();
  const { data: categories, isLoading: isLoadingCategories } = useCategoriesQuery();
  const { colors } = useTheme();

  const [sourceUrl, setSourceUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.background, // slightly darker than surface
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.text.primary,
    },
    content: {
      padding: spacing.md,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.subtitle2,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      ...typography.body2,
      color: colors.text.primary,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    thumbnailPreview: {
      width: '100%',
      height: 200,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      backgroundColor: colors.border,
    },
    thumbnailPlaceholder: {
      width: '100%',
      height: 200,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      backgroundColor: colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    placeholderText: {
      ...typography.body2,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
    },
    selectButtonText: {
      ...typography.body2,
      color: colors.text.primary,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    disabledButton: {
      opacity: 0.7,
    },
    submitButtonText: {
      ...typography.button,
      color: colors.surface,
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      maxHeight: '80%',
      padding: spacing.md,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.text.primary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    categoryList: {
      marginBottom: spacing.md,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    selectedCategoryItem: {
      backgroundColor: colors.primaryLight + '20', // 20% opacity
      borderRadius: borderRadius.sm,
    },
    categoryItemText: {
      ...typography.body1,
      color: colors.text.primary,
    },
    selectedCategoryItemText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    closeButton: {
      alignItems: 'center',
      padding: spacing.sm,
    },
    closeButtonText: {
      ...typography.button,
      color: colors.text.secondary,
    },
  }), [colors]);

  const handleSubmit = async () => {
    if (!sourceUrl) {
      Alert.alert('Hata', 'Lütfen bir kaynak URL girin.');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Hata', 'Lütfen bir kategori seçin.');
      return;
    }

    const tagsArray = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);

    try {
      await createPostMutation.mutateAsync({
        sourceUrl,
        caption,
        thumbnailUrl: thumbnailUrl || undefined,
        mediaType: 'video', // Default to video as per requirement
        isPrivate,
        categoryId: selectedCategoryId,
        tags: tagsArray,
      });
      Alert.alert('Başarılı', 'Post başarıyla oluşturuldu.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Post oluşturulurken bir hata oluştu.');
    }
  };

  const renderCategoryModal = () => {
    if (!showCategoryModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kategori Seç</Text>
          <ScrollView style={styles.categoryList}>
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategoryId === category.id && styles.selectedCategoryItem,
                ]}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategoryId === category.id && styles.selectedCategoryItemText,
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategoryId === category.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedCategoryName = categories?.find((c) => c.id === selectedCategoryId)?.name;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Post Ekle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kaynak URL (Twitter/X)</Text>
          <TextInput
            style={styles.input}
            value={sourceUrl}
            onChangeText={setSourceUrl}
            placeholder="https://twitter.com/..."
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thumbnail URL</Text>
          <TextInput
            style={styles.input}
            value={thumbnailUrl}
            onChangeText={setThumbnailUrl}
            placeholder="https://..."
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
          />
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailPreview} resizeMode="cover" />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.text.tertiary} />
              <Text style={styles.placeholderText}>Önizleme yok</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Post açıklaması..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={selectedCategoryId ? styles.selectButtonText : styles.placeholderText}>
              {selectedCategoryName || 'Kategori Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Etiketler (Virgül ile ayırın)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="komik, spor, haber..."
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Gizli Post</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: colors.text.tertiary, true: colors.primaryLight }}
            thumbColor={isPrivate ? colors.primary : colors.surface}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, createPostMutation.isPending && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>Oluştur</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderCategoryModal()}
    </KeyboardAvoidingView>
  );
};
