import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Collection } from '../domain/types';
import { colors, spacing, borderRadius, typography } from '../../../core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {collection.name}
          </Text>
          {collection.isPrivate && (
            <Ionicons name="lock-closed" size={16} color={colors.text.secondary} />
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {collection.description || 'No description'}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.count}>
            {collection.postCount} {collection.postCount === 1 ? 'Post' : 'Posts'}
          </Text>
          <Text style={styles.date}>
            {new Date(collection.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  count: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
