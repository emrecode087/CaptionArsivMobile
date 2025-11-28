import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileMenu = ({ visible, onClose }: ProfileMenuProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { user } = useAuthStore();
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingBottom: insets.bottom + spacing.md,
      maxHeight: '80%',
    },
    header: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    menuText: {
      ...typography.body,
      color: colors.text.primary,
      marginLeft: spacing.md,
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingLeft: spacing.xxl,
    },
    themeText: {
      ...typography.body,
      color: colors.text.secondary,
      marginLeft: spacing.md,
      flex: 1,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  }), [colors, insets.bottom]);

  const handleNavigation = (screen: string) => {
    onClose();
    navigation.navigate(screen);
  };

  const renderThemeOption = (mode: 'light' | 'dark' | 'system', label: string) => (
    <TouchableOpacity 
      style={styles.themeOption} 
      onPress={() => setThemeMode(mode)}
    >
      <View style={styles.radioButton}>
        {themeMode === mode && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.themeText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.handle} />
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Profile')}>
                <Ionicons name="person-outline" size={24} color={colors.text.primary} />
                <Text style={styles.menuText}>Profilim</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { /* Navigate to Liked Posts */ onClose(); }}>
                <Ionicons name="heart-outline" size={24} color={colors.text.primary} />
                <Text style={styles.menuText}>Beğendiklerin</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Settings')}>
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
                <Text style={styles.menuText}>Ayarlar</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { /* Navigate to Feedback */ onClose(); }}>
                <Ionicons name="chatbox-outline" size={24} color={colors.text.primary} />
                <Text style={styles.menuText}>Geri Bildirim Gönder</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => setShowThemeOptions(!showThemeOptions)}>
                <Ionicons name={themeMode === 'dark' ? "moon-outline" : "sunny-outline"} size={24} color={colors.text.primary} />
                <Text style={styles.menuText}>Görünüm</Text>
                <Ionicons name={showThemeOptions ? "chevron-up" : "chevron-down"} size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              {showThemeOptions && (
                <View>
                  {renderThemeOption('light', 'Aydınlık Mod')}
                  {renderThemeOption('dark', 'Karanlık Mod')}
                  {renderThemeOption('system', 'Sistem Ayarlarını Kullan')}
                </View>
              )}

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
