import { useEffect } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { appConfig } from '@/core/config/appConfig';
import { usePostsQuery } from '@/features/posts/data/usePostsQuery';
import { PostCard } from '@/features/posts/ui/PostCard';

export const ApiStatusScreen = () => {
  const {
    data: posts,
    error,
    isFetching,
    isFetched,
    refetch,
  } = usePostsQuery(
    {
      includePrivate: false,
      includeDeleted: false,
    },
    {
      enabled: true,
    },
  );

  useEffect(() => {
    if (error) {
      console.warn('Post listesi alınırken hata oluştu', error);
    }
  }, [error]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>API Yapılandırması</Text>
        <Text style={styles.label}>Base URL:</Text>
        <Text selectable style={styles.value}>
          {appConfig.api.baseUrl || 'Tanımlı değil'}
        </Text>
        <Button title="Listeyi Yenile" onPress={() => refetch()} disabled={isFetching} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Posts</Text>
        {isFetching && <ActivityIndicator size="small" />}
        {error && <Text style={styles.error}>Hata: {error.message}</Text>}
        {isFetched && !posts?.length && !error && <Text>Şu an gösterilecek post yok.</Text>}
      </View>

      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontSize: 14,
    color: '#222',
  },
  error: {
    color: '#c1121f',
    fontWeight: '500',
  },
});
