import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from '../data/usePostsQuery';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Comment } from '../domain/types';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export const CommentsModal = ({ visible, onClose, postId }: CommentsModalProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const { colors } = useTheme();

  const { data: comments, isLoading } = useCommentsQuery(postId);
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

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
      borderBottomWidth: 1,
      borderBottomColor: colors.border, // slightly darker
      backgroundColor: colors.surface,
    },
    title: {
      ...typography.h3,
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: spacing.md,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body2,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    avatarText: {
      ...typography.subtitle2,
      color: colors.primaryDark,
    },
    commentContent: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderTopLeftRadius: 0,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    userName: {
      ...typography.subtitle2,
      color: colors.text.primary,
    },
    date: {
      ...typography.small,
      color: colors.text.tertiary,
    },
    commentText: {
      ...typography.body2,
      color: colors.text.primary,
    },
    deleteButton: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingRight: spacing.xl,
      maxHeight: 100,
      ...typography.body2,
      color: colors.text.primary,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    disabledSendButton: {
      backgroundColor: colors.text.tertiary,
    },
  }), [colors]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({ postId, content: newComment });
      setNewComment('');
    } catch (error) {
      Alert.alert('Hata', 'Yorum gönderilemedi.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Yorumu Sil', 'Bu yorumu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => deleteCommentMutation.mutate({ postId, commentId }),
      },
    ]);
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isOwnComment = user?.id === item.userId;
    const canDelete = isOwnComment || user?.roles.includes('SuperAdmin') || user?.roles.includes('Moderator');

    return (
      <View style={styles.commentItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Yorumlar</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderCommentItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
              </View>
            }
          />
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            style={styles.input}
            placeholder="Yorum yaz..."
            placeholderTextColor={colors.text.tertiary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newComment.trim() && styles.disabledSendButton]}
            onPress={handleSendComment}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Ionicons name="send" size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
