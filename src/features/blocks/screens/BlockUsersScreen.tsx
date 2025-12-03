import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useUnblockUserMutation } from '../data/useBlocksMutations';
import { useBlockedListQuery, useUpdateBlockedCache } from '../data/useBlocksQuery';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';

export const BlockUsersScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const unblockMutation = useUnblockUserMutation();
  const { data, isLoading: isFetching } = useBlockedListQuery();
  const updateCache = useUpdateBlockedCache();
  const users = data?.users ?? [];

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleUnblock = (userId: string, userName?: string | null) => {
    Alert.alert('Engeli kaldir', `@${userName ?? 'kullanici'} engel kaldirilsin mi?`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Kaldir',
        style: 'destructive',
        onPress: () => {
          unblockMutation.mutate(userId, {
            onSuccess: () => {
              updateCache((prev) => {
                if (!prev) return prev;
                return { ...prev, users: (prev.users ?? []).filter((u) => u.id !== userId) };
              });
              Alert.alert('Engel kaldirildi', `@${userName ?? 'kullanici'} artik engelli degil.`);
            },
            onError: () => Alert.alert('Hata', 'Islem tamamlanamadi.'),
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>Engellenmi\u015f Kullan\u0131c\u0131lar</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {isFetching ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.text.tertiary }]}>Engellenmi\u015f kullan\u0131c\u0131 yok.</Text>
            }
            renderItem={({ item }) => {
              const avatarUrl = resolveMediaUrl(item.profileImageUrl);
              return (
                <View style={[styles.userRow, { borderColor: colors.border }]}>
                  <View style={styles.userInfo}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }]}>
                        <Text style={[styles.avatarText, { color: colors.text.primary }]}>
                          {item.userName?.charAt(0)?.toUpperCase() ?? '?'}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={[styles.userName, { color: colors.text.primary }]}>@{item.userName}</Text>
                      <Text style={[styles.userId, { color: colors.text.secondary }]} numberOfLines={1}>
                        {item.id}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.unblockButton}
                    onPress={() => handleUnblock(item.id, item.userName)}
                    disabled={unblockMutation.isPending}
                  >
                    {unblockMutation.isPending ? (
                      <ActivityIndicator color={colors.error} />
                    ) : (
                      <Ionicons name="close-circle" size={22} color={colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
    },
    title: {
      ...typography.subtitle1,
      fontWeight: '700',
    },
    body: {
      padding: spacing.md,
      gap: spacing.md,
      flex: 1,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.bodyBold,
    },
    userName: {
      ...typography.bodyBold,
    },
    userId: {
      ...typography.small,
      maxWidth: 200,
    },
    unblockButton: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
    },
    empty: {
      ...typography.body2,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

export default BlockUsersScreen;
