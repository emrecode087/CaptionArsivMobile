import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    },
    contentContainer: {
      paddingHorizontal: spacing.md,
    },
    tab: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    tabText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.text.primary,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      left: spacing.md,
      right: spacing.md,
      height: 3,
      backgroundColor: colors.primary,
      borderRadius: 1.5,
    },
  }), [colors]);

  const tabs: { id: MainTabType; label: string }[] = [
    { id: 'home', label: 'Anasayfa' },
    { id: 'top', label: 'Popüler' },
    { id: 'fresh', label: 'Yeni' },
    { id: 'collections', label: 'Koleksiyonun' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
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
      </ScrollView>
    </View>
  );
};
