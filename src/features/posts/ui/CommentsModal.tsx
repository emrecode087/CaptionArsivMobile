import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '../data/usePostsQuery';
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

const POPULAR_EMOJIS = ['🔥', '❤️', '👏', '😂', '😮', '😢', '😡', '👍', '🎉', '👀'];

export const CommentsModal = ({ visible, onClose, postId }: CommentsModalProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const { colors } = useTheme();
  const screenHeight = useMemo(() => Dimensions.get('window').height, []);

  // Animasyon Değerleri
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Scroll Pozisyon Takibi
  const scrollOffset = useRef(0);

  const { data: comments, isLoading } = useCommentsQuery(postId);
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const handleEmojiSelect = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: '85%',
          paddingBottom: insets.bottom,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 14,
          elevation: 16,
          overflow: 'hidden',
        },
        headerArea: {
          backgroundColor: colors.surface,
          paddingTop: spacing.sm,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          zIndex: 10,
        },
        handle: {
          alignSelf: 'center',
          width: 46,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.border,
          marginBottom: spacing.sm,
        },
        headerContent: {
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
        },
        listWrapper: {
          flex: 1,
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
          marginTop: spacing.md,
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
        emojiListContainer: {
          backgroundColor: colors.surface,
          paddingVertical: spacing.xs,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        emojiContent: {
          paddingHorizontal: spacing.sm,
        },
        emojiItem: {
          padding: spacing.sm,
          marginRight: spacing.xs,
        },
        emojiText: {
          fontSize: 22,
        },
        inputWrapper: {
          // borderTopWidth removed, moved to emojiListContainer
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

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose, screenHeight, translateY, opacity]);

  // --- PAN RESPONDER MANTIĞI ---

  // Ortak hareket işleyici
  const handlePanMove = (_: any, gestureState: any) => {
    // Sadece aşağı doğru harekete izin ver
    if (gestureState.dy > 0) {
      translateY.setValue(gestureState.dy);
    }
  };

  // Ortak bırakma işleyici
  const handlePanRelease = (_: any, gestureState: any) => {
    if (gestureState.dy > 150 || gestureState.vy > 0.8) {
      closeSheet();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    }
  };

  // 1. Header PanResponder: Header'dan tutunca her zaman sürüklemeye izin ver
  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Header'a dokunulduğunda yakala
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy, dx } = gestureState;
        // Yatay kaydırmada devreye girme
        if (Math.abs(dx) > Math.abs(dy)) return false;
        // Aşağı veya yukarı hareket
        return Math.abs(dy) > 5;
      },
      onPanResponderMove: handlePanMove,
      onPanResponderRelease: handlePanRelease,
    })
  ).current;

  // 2. List PanResponder: Liste üzerinden tutunca sadece en tepedeyse izin ver
  const listPanResponder = useRef(
    PanResponder.create({
      // Capture phase kullanarak FlatList'ten önce yakalıyoruz
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const { dy, dx } = gestureState;
        
        // Yatay hareket baskınsa karışma
        if (Math.abs(dx) > Math.abs(dy)) return false;

        // Yukarı itiyorsa (liste aşağı scroll olacak) KESİNLİKLE karışma
        if (dy < 0) return false;

        // Aşağı çekiyorsa ve liste tepedeyse YAKALA
        // dy > 5 toleransı
        if (dy > 5 && scrollOffset.current <= 0) {
          return true;
        }

        return false;
      },
      onPanResponderMove: handlePanMove,
      onPanResponderRelease: handlePanRelease,
    })
  ).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(screenHeight);
      opacity.setValue(0);
      scrollOffset.current = 0;
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, screenHeight, translateY, opacity]);

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isOwnComment = user?.id === item.userId;
    const canDelete =
      isOwnComment || user?.roles.includes('SuperAdmin') || user?.roles.includes('Moderator');

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

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[styles.overlay, { opacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Header Bölümü - Kendi PanResponder'ı var */}
          <View style={styles.headerArea} {...headerPanResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>Yorumlar</Text>
              <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste Bölümü - Kendi PanResponder'ı var */}
          <View style={styles.listWrapper} {...listPanResponder.panHandlers}>
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
                onScroll={({ nativeEvent }) => {
                  scrollOffset.current = nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                  </View>
                }
                keyboardShouldPersistTaps="handled"
                bounces={false} // Bounces kapalı, böylece negatif scroll ile karışmaz
                overScrollMode="never"
              />
            )}
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 64 : 0}
          >
            <View style={styles.emojiListContainer}>
              <FlatList
                data={POPULAR_EMOJIS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.emojiContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.emojiItem} 
                    onPress={() => handleEmojiSelect(item)}
                  >
                    <Text style={styles.emojiText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>

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
                />
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
