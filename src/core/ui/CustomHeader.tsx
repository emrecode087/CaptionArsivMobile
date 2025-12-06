import React, { useMemo, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography } from '@/core/theme/tokens';
import { useUIStore } from '@/core/stores/useUIStore';
import { useTheme } from '@/core/theme/useTheme';
import { ProfileMenu } from '@/features/profile/ui/ProfileMenu';
import { useUnreadNotificationsQuery } from '@/features/notifications/data/useNotificationsQuery';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';

interface CustomHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  title?: string;
  showBack?: boolean;
}

export const CustomHeader = ({ onSearchPress, onNotificationPress, title, showBack }: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { toggleSidebar } = useUIStore();
  const { colors, isDark } = useTheme();
  const { data: unreadCount } = useUnreadNotificationsQuery();
  const hasUnread = (unreadCount ?? 0) > 0;
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const { user } = useAuthStore();
  const avatarUrl = resolveMediaUrl(user?.profileImageUrl);
  const logoSource = isDark ? require('../../../assets/logo.png') : require('../../../assets/logo_light.png');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      zIndex: 100,
    },
    content: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.xs,
    },
    logo: {
      height: 32,
      width: 32, 
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    rightSection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconButton: {
      padding: spacing.xs,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surfaceHighlight,
    },
    avatarFallback: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarFallbackText: {
      ...typography.subtitle2,
      color: colors.text.primary,
    },
    badgeContainer: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      paddingHorizontal: 4,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.surface,
      fontSize: 10,
      fontWeight: '700',
    },
  }), [colors]);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Left Section: Menu + Logo + Title */}
          <View style={styles.leftSection}>
            {showBack ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
                <Ionicons name="menu" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            
            {!title && (
              <Image 
                source={logoSource} 
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.title}>{title || 'Caption Arşiv'}</Text>
          </View>

          {/* Right Section: Actions */}
          {!showBack && (
            <View style={styles.rightSection}>
              <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
                <Ionicons name="search-outline" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
                {hasUnread && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {unreadCount && unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsProfileMenuVisible(true)} style={styles.iconButton}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {user?.userName?.charAt(0)?.toUpperCase() ?? 'P'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ProfileMenu 
        visible={isProfileMenuVisible} 
        onClose={() => setIsProfileMenuVisible(false)} 
      />
    </>
  );
};


