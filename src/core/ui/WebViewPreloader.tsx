import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PRELOAD_HTML = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div>preload</div>
    <script>
      // warm up JS engine
      window.__preloadTime = Date.now();
    </script>
  </body>
</html>
`;

export const WebViewPreloader = () => {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Unmount after warm-up to avoid extra memory
    const timer = setTimeout(() => setMounted(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <WebView
        source={{ html: PRELOAD_HTML }}
        userAgent="CaptionArsivApp/1.0"
        cacheEnabled
        incognito={false}
        originWhitelist={['*']}
        startInLoadingState={false}
        javaScriptEnabled
        domStorageEnabled
        onError={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
    zIndex: -9999,
  },
});
