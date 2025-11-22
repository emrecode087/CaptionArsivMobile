import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable, ScrollView, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/core/theme/tokens';
import { useUIStore } from '@/core/stores/useUIStore';
import { useCategoriesQuery } from '@/features/categories/data/useCategoriesQuery';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.80;

export const Sidebar = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const { data: categories } = useCategoriesQuery();
  const { canManageCategories } = usePermissions();

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isSidebarOpen) {
      translateX.value = withTiming(0, { 
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 400 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { 
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSidebarOpen]);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      zIndex: isSidebarOpen ? 1000 : -1,
    };
  });

  const handleClose = () => {
    setSidebarOpen(false);
  };

  const handleCategoryPress = (id: string, name: string) => {
    handleClose();
    navigation.navigate('CategoryPosts', { categoryId: id, categoryName: name });
  };

  if (!isSidebarOpen && opacity.value === 0) return null;

  return (
    <>
      <Animated.View style={[styles.backdrop, rBackdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>
      
      <Animated.View style={[styles.container, rStyle, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {canManageCategories && (
            <>
              <Text style={styles.sectionTitle}>Menü</Text>
              <TouchableOpacity
                style={[styles.item, styles.manageItem]}
                onPress={() => {
                  handleClose();
                  navigation.navigate('CategoriesManagement');
                }}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.itemText, styles.manageText]}>Kategorileri Yönet</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: canManageCategories ? spacing.lg : 0 }]}>Kategoriler</Text>

          {categories?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.item}
              onPress={() => handleCategoryPress(category.id, category.name)}
            >
              <View style={styles.itemIcon}>
                <Ionicons name="folder-outline" size={20} color={colors.text.secondary} />
              </View>
              <Text style={styles.itemText}>{category.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  logo: {
    width: 120,
    height: 40,
  },
  closeButton: {
    padding: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemIcon: {
    marginRight: spacing.md,
    width: 24,
    alignItems: 'center',
  },
  itemText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  manageItem: {
    backgroundColor: colors.primary + '10', // 10% opacity
  },
  manageText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
