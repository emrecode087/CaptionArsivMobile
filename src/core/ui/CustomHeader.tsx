import React, { useMemo, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography } from '@/core/theme/tokens';
import { useUIStore } from '@/core/stores/useUIStore';
import { useTheme } from '@/core/theme/useTheme';
import { ProfileMenu } from '@/features/profile/ui/ProfileMenu';

interface CustomHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export const CustomHeader = ({ onSearchPress, onNotificationPress }: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { toggleSidebar } = useUIStore();
  const { colors } = useTheme();
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

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
  }), [colors]);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Left Section: Menu + Logo + Title */}
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
              <Ionicons name="menu" size={28} color={colors.text.primary} />
            </TouchableOpacity>
            
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Caption Arşiv</Text>
          </View>

          {/* Right Section: Actions */}
          <View style={styles.rightSection}>
            <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsProfileMenuVisible(true)} style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ProfileMenu 
        visible={isProfileMenuVisible} 
        onClose={() => setIsProfileMenuVisible(false)} 
      />
    </>
  );
};


