import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography } from '@/core/theme/tokens';
import { useTagsQuery } from '../data/useTagsQuery';

interface HomeTagsProps {
  selectedTagId?: string | null;
  onSelectTag: (tagId: string | null) => void;
}

export const HomeTags = ({ selectedTagId, onSelectTag }: HomeTagsProps) => {
  const { colors } = useTheme();
  const { data: tags, isLoading } = useTagsQuery();

  if (__DEV__) {
    console.log('[HomeTags] tags:', tags, 'isArray:', Array.isArray(tags));
  }

  const featuredTags = (Array.isArray(tags) ? tags : [])?.filter(tag => tag.isFeatured) || [];

  if (isLoading || featuredTags.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedTag: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagText: {
      ...typography.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    selectedTagText: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {featuredTags.map((tag) => {
          // Use name for filtering since slugs are empty in current API response
          const tagValue = tag.name; 
          const isSelected = selectedTagId === tagValue;
          
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tag, isSelected && styles.selectedTag]}
              onPress={() => onSelectTag(isSelected ? null : tagValue)}
            >
              <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
