import React, { useMemo, useRef, useState } from 'react';
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
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
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

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.floor(hours / 24);
  return `${days} g`;
};

export const CommentsModal = ({ visible, onClose, postId }: CommentsModalProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  const { data: comments, isLoading } = useCommentsQuery(postId);
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          maxHeight: '85%',
          paddingBottom: insets.bottom || spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 14,
          elevation: 16,
        },
        handle: {
          alignSelf: 'center',
          width: 46,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.border,
          marginTop: spacing.sm,
          marginBottom: spacing.sm,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
        },
        title: {
          ...typography.subtitle1,
          fontWeight: '700',
          color: colors.text.primary,
        },
        closeButton: {
          padding: spacing.xs,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: spacing.lg,
        },
        listContent: {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.lg * 3,
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
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        avatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
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
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
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
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginTop: spacing.xs,
        },
        metaText: {
          ...typography.small,
          color: colors.text.tertiary,
        },
        deleteButton: {
          padding: spacing.xs,
          marginLeft: spacing.xs,
        },
        inputWrapper: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surface,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: colors.surfaceHighlight,
          borderRadius: borderRadius.lg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
        input: {
          flex: 1,
          ...typography.body2,
          color: colors.text.primary,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          maxHeight: 120,
        },
        sendButton: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: spacing.xs,
        },
        disabledSendButton: {
          backgroundColor: colors.text.tertiary,
        },
      }),
    [colors, insets.bottom],
  );

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
            <Text style={styles.date}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Yanıtla</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="heart-outline" size={14} color={colors.text.tertiary} />
              <Text style={styles.metaText}>0</Text>
            </TouchableOpacity>
          </View>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    });
  }, [onClose, translateY]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
          <View style={styles.handle} />
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
              contentContainerStyle={[
                styles.listContent,
                !comments?.length ? { flex: 1, justifyContent: 'center' } : null,
              ]}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
            />
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 64 : 0}
          >
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(user?.userName?.[0] || 'K').toUpperCase()}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Yorum yaz..."
                  placeholderTextColor={colors.text.tertiary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                  scrollEnabled
                  textAlignVertical="center"
                />
                <TouchableOpacity style={{ padding: spacing.xs }}>
                  <Ionicons name="attach" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: spacing.xs }}>
                  <Ionicons name="happy-outline" size={18} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, !newComment.trim() && styles.disabledSendButton]}
                  onPress={handleSendComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Ionicons name="send" size={18} color={colors.surface} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};
