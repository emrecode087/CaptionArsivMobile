import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useCategoriesQuery, useReorderCategoriesMutation } from '../data/useCategoriesQuery';
import { Category } from '../domain/types';
import { sortCategories } from '../domain/sortCategories';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CategoryReorderScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: categories, isLoading } = useCategoriesQuery();
  const reorderMutation = useReorderCategoriesMutation();
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categories) {
      setLocalCategories(sortCategories(categories));
    }
  }, [categories]);

  const handleDragEnd = ({ data }: { data: Category[] }) => {
    setLocalCategories(data);
  };

  const handleSave = () => {
    const ids = localCategories.map(c => c.id);
    reorderMutation.mutate(ids, {
      onSuccess: () => {
        navigation.goBack();
      }
    });
  };

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Category>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            { 
              backgroundColor: isActive ? colors.surfaceHighlight : colors.surface,
              borderColor: colors.border 
            }
          ]}
        >
          <View style={styles.itemContent}>
            <Text style={[styles.text, { color: colors.text.primary }]}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.subtext, { color: colors.text.secondary }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <Ionicons name="menu" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.text.primary,
    },
    saveButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
    },
    saveButtonText: {
      ...typography.button,
      color: colors.text.inverse,
    },
    listContent: {
      padding: spacing.md,
    },
    rowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      justifyContent: 'space-between',
    },
    itemContent: {
      flex: 1,
    },
    text: {
      ...typography.body,
      fontWeight: '600',
    },
    subtext: {
      ...typography.caption,
      marginTop: 2,
    },
    dragHandle: {
      padding: spacing.sm,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
           <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sıralamayı Düzenle</Text>
        <TouchableOpacity 
          style={[styles.saveButton, reorderMutation.isPending && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={reorderMutation.isPending}
        >
          {reorderMutation.isPending ? (
             <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
             <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <DraggableFlatList
        data={localCategories}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};
