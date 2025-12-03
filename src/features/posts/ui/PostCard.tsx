import { memo, useState, useEffect, useMemo, useRef } from 'react';
import { logger } from '@/core/utils/logger';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Linking,
  Pressable,
  Image,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import type { Post } from '../domain/types';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { AddToCollectionModal } from '@/features/collections/ui/AddToCollectionModal';
import { useMyCollectionsQuery } from '@/features/collections/data/useCollectionsQuery';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useLikePostMutation, useUnlikePostMutation, postsQueryKeys } from '../data/usePostsQuery';
import { useTheme } from '@/core/theme/useTheme';
import { CommentsModal } from './CommentsModal';
import { useBlockUserMutation, useBlockTagMutation, useBlockCategoryMutation } from '@/features/blocks/data/useBlocksMutations';
import { useUpdateBlockedCache } from '@/features/blocks/data/useBlocksQuery';

interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const PostCard = memo(({ post, isDetailView = false }: PostCardProps) => {
  const navigation = useNavigation<any>();
  const isScreenFocused = useIsFocused();
  const [webViewHeight, setWebViewHeight] = useState(300);
  const [isLoadingEmbed, setIsLoadingEmbed] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [isBlockSheetVisible, setIsBlockSheetVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(post.tags?.[0] ?? null);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const webViewRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const updateBlocksCache = useUpdateBlockedCache();
  const { data: myCollectionsData } = useMyCollectionsQuery({ includePosts: true });
  const [savedCollectionIds, setSavedCollectionIds] = useState<string[]>([]);
  
  const likeMutation = useLikePostMutation();
  const unlikeMutation = useUnlikePostMutation();
  const blockUserMutation = useBlockUserMutation();
  const blockTagMutation = useBlockTagMutation();
  const blockCategoryMutation = useBlockCategoryMutation();
  
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 0,
      paddingVertical: spacing.md,
      paddingHorizontal: 0,
      marginVertical: spacing.xs,
      marginHorizontal: 0,
      borderWidth: 0,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: spacing.md,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.primaryDark,
      fontWeight: '700',
      fontSize: 16,
    },
    username: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    date: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    moreButton: {
      padding: 4,
    },
    caption: {
      fontSize: 15,
      color: colors.text.primary,
      lineHeight: 22,
      marginBottom: 12,
      paddingHorizontal: spacing.md,
    },
    embedContainer: {
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderRadius: 0,
      maxHeight: 500,
    },
    webview: {
      backgroundColor: 'transparent',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors.surfaceHighlight,
    },
    loadingImage: {
      ...StyleSheet.absoluteFillObject,
    },
    playIcon: {
      position: 'absolute',
      alignSelf: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    tag: {
      backgroundColor: colors.surfaceHighlight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    tagText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    footer: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
    },
    actions: {
      flexDirection: 'row',
      gap: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    likedText: {
      color: colors.primary,
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
    sheetHint: {
      ...typography.body2,
      marginLeft: spacing.sm,
      marginBottom: -spacing.xs,
    },
  }), [colors]);

  useEffect(() => {
    logger.log('[PostCard] Post updated - id:', post.id, 'isLikedByCurrentUser:', post.isLikedByCurrentUser, 'likeCount:', post.likeCount);
    setIsLiked(post.isLikedByCurrentUser);
    setLikeCount(post.likeCount);
  }, [post.isLikedByCurrentUser, post.likeCount, post.id]);

  const pauseEmbeddedMedia = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.__pauseMedia && window.__pauseMedia();
        true;
      `);
    }
  };

  useEffect(() => {
    if (!isScreenFocused) {
      pauseEmbeddedMedia();
    }
  }, [isScreenFocused]);

  const thumbnailUrl = useMemo(() => {
    const isSvgPlaceholder = post.thumbnailUrl?.startsWith('data:image/svg+xml');

    // Prefer embed preview if available (often real media thumb)
    if (post.embedHtml) {
      const match = post.embedHtml.match(/<img[^>]+src="([^">]+)"/);
      if (match?.[1]) {
        return match[1];
      }
    }

    if (post.thumbnailUrl && !isSvgPlaceholder) {
      return post.thumbnailUrl;
    }

    return null;
  }, [post.thumbnailUrl, post.embedHtml]);

  useEffect(() => {
    const collections = myCollectionsData?.data ?? [];
    const ids = collections
      .filter((col) => col.posts?.some((p) => p.postId === post.id))
      .map((col) => col.id);
    const hasDiff =
      ids.length !== savedCollectionIds.length ||
      ids.some((id, idx) => savedCollectionIds[idx] !== id);
    if (hasDiff) {
      setSavedCollectionIds(ids);
    }
  }, [myCollectionsData?.data, post.id, savedCollectionIds]);

  const filterFeedAfterBlock = (predicate: (p: Post) => boolean) => {
    const queries = queryClient.getQueriesData<Post[]>({ queryKey: postsQueryKeys.all });
    queries.forEach(([key, data]) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData(
          key,
          data.filter((item) => !predicate(item)),
        );
      }
    });

    if (predicate(post)) {
      queryClient.removeQueries({ queryKey: postsQueryKeys.detail(post.id) });
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      Alert.alert('Giris yapmalisin', 'Begenmek icin lutfen giris yap.');
      return;
    }

    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      unlikeMutation.mutate(post.id, {
        onError: () => {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
        },
      });
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      likeMutation.mutate(post.id, {
        onError: () => {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        },
      });
    }
  };

  const confirmAndBlockUser = () => {
    if (!post.userId) return;
    setIsActionsVisible(false);
    setIsBlockSheetVisible(false);
    Alert.alert('Kullaniciyi engelle', `@${post.userName} engellensin mi?`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Engelle',
        style: 'destructive',
        onPress: () => {
          blockUserMutation.mutate(post.userId, {
            onSuccess: () => {
              filterFeedAfterBlock((p) => p.userId === post.userId);
              updateBlocksCache((prev) => {
                if (!prev) return prev;
                const exists = prev.users?.some((u) => u.id === post.userId);
                if (exists) return prev;
                return {
                  ...prev,
                  users: [...(prev.users ?? []), { id: post.userId, userName: post.userName, profileImageUrl: null }],
                };
              });
              setIsActionsVisible(false);
              if (isDetailView && navigation.canGoBack()) {
                navigation.goBack();
              }
              Alert.alert('Engellendi', `@${post.userName} engellendi.`);
            },
            onError: () => Alert.alert('Islem basarisiz', 'Engelleme tamamlanamadi.'),
          });
        },
      },
    ]);
  };

  const confirmAndBlockTag = () => {
    const tag = selectedTag ?? post.tags?.[0];
    if (!tag) return;
    setIsActionsVisible(false);
    setIsBlockSheetVisible(false);
    Alert.alert('Etiketi engelle', `#${tag} engellensin mi?`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Engelle',
        style: 'destructive',
        onPress: () => {
          blockTagMutation.mutate(tag, {
            onSuccess: () => {
              filterFeedAfterBlock((p) => p.tags?.includes(tag));
              updateBlocksCache((prev) => {
                if (!prev) return prev;
                const exists = prev.tags?.includes(tag);
                return { ...prev, tags: exists ? prev.tags : [...(prev.tags ?? []), tag] };
              });
              setIsActionsVisible(false);
              if (isDetailView && navigation.canGoBack()) {
                navigation.goBack();
              }
              Alert.alert('Engellendi', `#${tag} engellendi.`);
            },
            onError: () => Alert.alert('Islem basarisiz', 'Engelleme tamamlanamadi.'),
          });
        },
      },
    ]);
  };

  const confirmAndBlockCategory = () => {
    if (!post.categoryId) return;
    setIsActionsVisible(false);
    setIsBlockSheetVisible(false);
    Alert.alert('Kategoriyi engelle', `${post.categoryName ?? 'Kategori'} engellensin mi?`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Engelle',
        style: 'destructive',
        onPress: () => {
          blockCategoryMutation.mutate(post.categoryId as string, {
            onSuccess: () => {
              filterFeedAfterBlock((p) => p.categoryId === post.categoryId);
              updateBlocksCache((prev) => {
                if (!prev) return prev;
                const exists = prev.categories?.some((c) => c.id === post.categoryId);
                if (exists) return prev;
                return {
                  ...prev,
                  categories: [...(prev.categories ?? []), { id: post.categoryId!, name: post.categoryName ?? post.categoryId! }],
                };
              });
              setIsActionsVisible(false);
              if (isDetailView && navigation.canGoBack()) {
                navigation.goBack();
              }
              Alert.alert('Engellendi', 'Kategori engellendi.');
            },
            onError: () => Alert.alert('Islem basarisiz', 'Engelleme tamamlanamadi.'),
          });
        },
      },
    ]);
  };

  const handlePress = () => {};



  const injectedJavaScript = `
    (function() {
      function sendHeight() {
        const tweet = document.querySelector('.twitter-tweet');
        const height = tweet ? tweet.getBoundingClientRect().height : document.documentElement.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
      }

      window.__pauseMedia = function() {
        try {
          const media = document.querySelectorAll('video, audio');
          media.forEach(m => { if (m.pause) { m.pause(); } m.muted = true; });
        } catch (_) {}
        try {
          const frames = document.querySelectorAll('iframe');
          frames.forEach(f => {
            try {
              const doc = f.contentDocument || f.contentWindow?.document;
              if (doc) {
                const innerMedia = doc.querySelectorAll('video, audio');
                innerMedia.forEach(m => { if (m.pause) { m.pause(); } m.muted = true; });
              }
            } catch (_) {}
          });
        } catch (_) {}
      };

      // Accept pause commands via custom event
      window.addEventListener('message', function(event) {
        if (event && event.data === 'PAUSE_MEDIA') {
          window.__pauseMedia();
        }
      });

      // Send initial height
      sendHeight();

      // Observe for changes (Twitter embed loads async)
      const observer = new MutationObserver(sendHeight);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });

      setTimeout(sendHeight, 1000);
      setTimeout(sendHeight, 2000);
      setTimeout(sendHeight, 3000);
    })();
    true;
  `;

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: transparent;
            overflow-x: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
          }
          .container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          blockquote {
            margin: 0 auto !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
            opacity: 0 !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${post.embedHtml || ''}
        </div>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </body>
    </html>
  `, [post.embedHtml]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 50) {
        setWebViewHeight((currentHeight) => {
          // Only update if the difference is significant (> 1px) to prevent infinite loops
          if (Math.abs(currentHeight - data.height) > 1) {
            return data.height;
          }
          return currentHeight;
        });
      }
    } catch (error) {
      console.warn('Failed to parse WebView message', error);
    }
  };

  const showPosterOverlay = (!isScreenFocused && !isDetailView) || isLoadingEmbed || !hasLoadedOnce;

  const handleCopyLink = async () => {
    if (!post.sourceUrl) {
      setIsActionsVisible(false);
      return;
    }
    try {
      await Share.share({ message: post.sourceUrl });
    } catch (error) {
      Alert.alert('Link kopyalanamadi', 'Lutfen tekrar deneyin.');
    } finally {
      setIsActionsVisible(false);
    }
  };

  const handleDownload = async () => {
    if (!post.sourceUrl) {
      setIsActionsVisible(false);
      return;
    }
    try {
      await Linking.openURL(post.sourceUrl);
    } catch (error) {
      Alert.alert('Indirme baslatilamadi', 'Linke erisilemiyor.');
    } finally {
      setIsActionsVisible(false);
    }
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={handlePress}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.username}>@{post.userName}</Text>
              <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton} onPress={() => setIsActionsVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
      </Pressable>

      {post.embedHtml && (
        <View style={[styles.embedContainer, { height: webViewHeight }]}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent, baseUrl: 'https://twitter.com' }}
            style={[styles.webview, { opacity: 0.99 }]}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            cacheEnabled
            incognito={false}
            userAgent="CaptionArsivApp/1.0"
            scalesPageToFit={false}
            bounces={false}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            onLoadStart={() => setIsLoadingEmbed(true)}
            onLoadEnd={() => {
              setIsLoadingEmbed(false);
              setHasLoadedOnce(true);
            }}
            onShouldStartLoadWithRequest={(request) => {
              const { url } = request;
              
              // Allow standard web content to load
              if (url.startsWith('http') || url.startsWith('https') || url.startsWith('about:blank')) {
                // If it's a user click (e.g. "Watch on X"), open in system browser
                if (request.navigationType === 'click') {
                  Linking.openURL(url).catch(() => {});
                  return false;
                }
                return true;
              }

              // Handle custom schemes (e.g. twitter://) by opening in system handler
              Linking.openURL(url).catch(() => {});
              return false;
            }}
          />

          {showPosterOverlay && (
            <View style={styles.loadingOverlay} pointerEvents="none">
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.loadingImage} resizeMode="cover" />
              ) : (
                <View style={[styles.loadingImage, { backgroundColor: colors.surfaceHighlight }]} />
              )}
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" style={styles.playIcon} />
            </View>
          )}
        </View>
      )}

      <Pressable onPress={handlePress}>
        {post.tags?.length ? (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLike}
            >
              <Ionicons 
                name={isLiked ? "arrow-up" : "arrow-up-outline"} 
                size={24} 
                color={isLiked ? '#1DA1F2' : colors.text.secondary} 
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsCommentsVisible(true)}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.actionText}>{post.commentCount}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                if (!isAuthenticated) {
                  Alert.alert('Login Required', 'Please login to add posts to collections.');
                  return;
                }
                setIsCollectionModalVisible(true);
              }}
            >
              <Ionicons
                name={savedCollectionIds.length > 0 ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={savedCollectionIds.length > 0 ? '#1DA1F2' : colors.text.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="flag-outline" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>

      <Modal visible={isActionsVisible} transparent animationType="slide" onRequestClose={() => setIsActionsVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setIsActionsVisible(false)}>
          <Pressable style={[styles.sheetContainer, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <TouchableOpacity style={styles.sheetItem} onPress={handleCopyLink}>
              <Ionicons name="link-outline" size={22} color={colors.text.primary} style={styles.sheetIcon} />
              <Text style={styles.sheetText}>Linki kopyala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={handleDownload}>
              <Ionicons name="download-outline" size={22} color={colors.text.primary} style={styles.sheetIcon} />
              <Text style={styles.sheetText}>Medyayi indir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setIsActionsVisible(false);
                setIsBlockSheetVisible(true);
              }}
            >
              <Ionicons name="hand-left-outline" size={22} color={colors.error} style={styles.sheetIcon} />
              <Text style={[styles.sheetText, { color: colors.error }]}>Engelle...</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isBlockSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsBlockSheetVisible(false);
          setShowTagPicker(false);
        }}
      >
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => {
            setIsBlockSheetVisible(false);
            setShowTagPicker(false);
          }}
        >
          <Pressable
            style={[styles.sheetContainer, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <TouchableOpacity style={styles.sheetItem} onPress={confirmAndBlockUser}>
              <Ionicons name="person-remove-outline" size={22} color={colors.error} style={styles.sheetIcon} />
              <Text style={[styles.sheetText, { color: colors.error }]}>Kullaniciyi engelle</Text>
            </TouchableOpacity>
            {post.tags?.length ? (
              <>
                <TouchableOpacity
                  style={styles.sheetItem}
                  onPress={() => {
                    setShowTagPicker((prev) => !prev);
                    if (!selectedTag) {
                      setSelectedTag(post.tags?.[0] ?? null);
                    }
                  }}
                >
                  <Ionicons name="pricetag-outline" size={22} color={colors.error} style={styles.sheetIcon} />
                  <Text style={[styles.sheetText, { color: colors.error }]}>Etiketi engelle</Text>
                </TouchableOpacity>
                {showTagPicker && (
                  <>
                    <Text style={[styles.sheetHint, { color: colors.text.secondary }]}>
                      Hangi etiketi engellemek istersin?
                    </Text>
                    {post.tags.map((tag) => {
                      const selected = selectedTag === tag;
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={styles.sheetItem}
                          onPress={() => setSelectedTag(tag)}
                        >
                          <Ionicons
                            name={selected ? 'radio-button-on' : 'radio-button-off'}
                            size={20}
                            color={selected ? colors.primary : colors.text.secondary}
                            style={styles.sheetIcon}
                          />
                          <Text style={styles.sheetText}>#{tag}</Text>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity style={styles.sheetItem} onPress={confirmAndBlockTag}>
                      <Ionicons name="pricetag-outline" size={22} color={colors.error} style={styles.sheetIcon} />
                      <Text style={[styles.sheetText, { color: colors.error }]}>Secili etiketi engelle</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : null}
            {post.categoryId ? (
              <TouchableOpacity style={styles.sheetItem} onPress={confirmAndBlockCategory}>
                <Ionicons name="folder-open-outline" size={22} color={colors.error} style={styles.sheetIcon} />
                <Text style={[styles.sheetText, { color: colors.error }]}>Kategoriyi engelle</Text>
              </TouchableOpacity>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <AddToCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        postId={post.id}
        onMembershipChange={(ids) => setSavedCollectionIds(Array.from(new Set(ids)))}
      />
      <CommentsModal visible={isCommentsVisible} onClose={() => setIsCommentsVisible(false)} postId={post.id} />
    </View>
  );
});

PostCard.displayName = 'PostCard';
