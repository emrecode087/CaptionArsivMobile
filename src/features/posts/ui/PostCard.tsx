import { memo, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

import type { Post } from '../domain/types';

interface PostCardProps {
  post: Post;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;
const EMBED_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

export const PostCard = memo(({ post }: PostCardProps) => {
  const [webViewHeight, setWebViewHeight] = useState(400);

  const injectedJavaScript = `
    (function() {
      function sendHeight() {
        const height = document.documentElement.scrollHeight;
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
          }
          .container {
            max-width: 100%;
            padding: 0;
          }
          blockquote {
            margin: 0 auto !important;
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
      if (data.height && data.height > 100) {
        setWebViewHeight(Math.min(data.height + 20, 800));
      }
    } catch (error) {
      console.warn('Failed to parse WebView message', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.username}>@{post.userName}</Text>
        <Text style={styles.date}>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</Text>
      </View>

      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

      {post.embedHtml && (
        <View style={[styles.embedContainer, { height: webViewHeight }]}>
          <WebView
            source={{ html: htmlContent }}
            style={styles.webview}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            scalesPageToFit={false}
            bounces={false}
          />
        </View>
      )}

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
        <Text style={styles.stats}>
          ❤️ {post.likeCount} · 💬 {post.commentCount}
        </Text>
      </View>
    </View>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  caption: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  embedContainer: {
    width: EMBED_WIDTH,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  stats: {
    fontSize: 13,
    color: '#666',
  },
});
