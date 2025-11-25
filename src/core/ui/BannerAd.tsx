import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BannerAd = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
      paddingTop: spacing.sm,
      height: 60 + (insets.bottom > 0 ? insets.bottom : spacing.sm),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      justifyContent: 'space-between',
      width: '100%',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    adBadge: {
      backgroundColor: '#f0ad4e',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginRight: spacing.sm,
    },
    adBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...typography.caption,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    description: {
      fontSize: 10,
      color: colors.text.secondary,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    buttonText: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>REKLAM</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mars'a Yolculuk Başladı! 🚀</Text>
          <Text style={styles.description}>İlk 100 kişiye %50 indirimli bilet.</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Keşfet</Text>
      </TouchableOpacity>
    </View>
  );
};
