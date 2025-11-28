import { memo, useState, useEffect, useMemo } from 'react';
import { logger } from '@/core/utils/logger';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Linking, Pressable, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import type { Post } from '../domain/types';
import { spacing } from '@/core/theme/tokens';
import { AddToCollectionModal } from '@/features/collections/ui/AddToCollectionModal';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { Alert } from 'react-native';
import { useLikePostMutation, useUnlikePostMutation } from '../data/usePostsQuery';
import { useTheme } from '@/core/theme/useTheme';

interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;

export const PostCard = memo(({ post, isDetailView = false }: PostCardProps) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [webViewHeight, setWebViewHeight] = useState(400);
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  
  const shouldShowWebView = isDetailView || isFocused;
  
  const likeMutation = useLikePostMutation();
  const unlikeMutation = useUnlikePostMutation();
  
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: CARD_PADDING,
      marginVertical: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
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
    },
    embedContainer: {
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'transparent',
      borderRadius: 12,
    },
    webview: {
      backgroundColor: 'transparent',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    tag: {
      backgroundColor: colors.surfaceHighlight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tagText: {
      fontSize: 12,
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
      color: colors.error,
    },
  }), [colors]);

  useEffect(() => {
    logger.log('[PostCard] Post updated - id:', post.id, 'isLikedByCurrentUser:', post.isLikedByCurrentUser, 'likeCount:', post.likeCount);
    setIsLiked(post.isLikedByCurrentUser);
    setLikeCount(post.likeCount);
  }, [post.isLikedByCurrentUser, post.likeCount, post.id]);

  const handleLike = () => {
    if (!isAuthenticated) {
      Alert.alert('Giriş Yapmalısınız', 'Beğenmek için lütfen giriş yapın.');
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

  const handlePress = () => {
    if (!isDetailView) {
      navigation.navigate('PostDetail', { postId: post.id });
    }
  };



  const injectedJavaScript = `
    (function() {
      function sendHeight() {
        // Get the height of the twitter-tweet element if it exists, otherwise body
        const tweet = document.querySelector('.twitter-tweet');
        const height = tweet ? tweet.getBoundingClientRect().height : document.documentElement.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
      }

      // Send initial height
      sendHeight();

      // Observe for changes (Twitter embed loads async)
      const observer = new MutationObserver(sendHeight);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });

      // Fallback for delayed content
      setTimeout(sendHeight, 1000);
      setTimeout(sendHeight, 2000);
      setTimeout(sendHeight, 3000);
    })();
    true;
  `;

  const htmlContent = `
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
  `;

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
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
      </Pressable>

      {post.embedHtml && (
        <View style={[styles.embedContainer, { height: webViewHeight }]}>
          {shouldShowWebView ? (
            <WebView
              source={{ html: htmlContent, baseUrl: 'https://twitter.com' }}
              style={[styles.webview, { opacity: 0.99 }]}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              injectedJavaScript={injectedJavaScript}
              onMessage={handleMessage}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
              scalesPageToFit={false}
              bounces={false}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={['*']}
              mixedContentMode="always"
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
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              {post.thumbnailUrl && (
                <Image source={{ uri: post.thumbnailUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              )}
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
            </View>
          )}
        </View>
      )}

      <Pressable onPress={handlePress}>
        {post.tags?.length ? (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
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
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? colors.error : colors.text.secondary} 
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
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
              <Ionicons name="bookmark-outline" size={22} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="flag-outline" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>

      <AddToCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        postId={post.id}
      />
    </View>
  );
});

PostCard.displayName = 'PostCard';
