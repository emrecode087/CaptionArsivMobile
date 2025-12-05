import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';

export type MainTabType = 'home' | 'top' | 'fresh' | 'collections';

interface SubMenuProps {
  activeTab: MainTabType;
  onTabPress: (tab: MainTabType) => void;
}

export const SubMenu = ({ activeTab, onTabPress }: SubMenuProps) => {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginTop: -spacing.md, // pull menu closer to header
    },
    tabsRow: {
      flexDirection: 'row',
      width: '100%',
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    tabText: {
      ...typography.body,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.text.primary,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: colors.primary,
      borderRadius: 1.5,
    },
  }), [colors]);

  const tabs: { id: MainTabType; label: string }[] = [
    { id: 'home', label: 'Anasayfa' },
    { id: 'top', label: 'Popüler' },
    { id: 'fresh', label: 'Yeni' },
    { id: 'collections', label: 'Koleksiyonlar' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => onTabPress(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
