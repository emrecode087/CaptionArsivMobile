import React, { useMemo } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/core/theme/tokens';
import { useUIStore } from '@/core/stores/useUIStore';
import { useTheme } from '@/core/theme/useTheme';

interface CustomHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export const CustomHeader = ({ onSearchPress, onNotificationPress }: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { toggleSidebar } = useUIStore();
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 100,
    },
    content: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
    },
    leftContainer: {
      flex: 1,
    },
    logoContainer: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      height: 32,
      width: 120, 
    },
    rightContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconButton: {
      padding: spacing.xs,
    },
  }), [colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left: Menu Button */}
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
            <Ionicons name="menu" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Center Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Right Actions */}
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


