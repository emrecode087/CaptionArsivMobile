import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { NotificationItem as NotificationItemType } from '../domain/types';

interface NotificationItemProps {
  item: NotificationItemType;
  onPress: (item: NotificationItemType) => void;
}

const NotificationItemComponent = ({ item, onPress }: NotificationItemProps) => {
  const { colors } = useTheme();

  const getIcon = () => {
    // Map numeric types to icons
    // Assuming: 0=PostLike, 1=PostComment, 2=Follow, 3=System (Adjust based on backend enum)
    switch (item.type) {
      case 0: // PostLike
        return <Ionicons name="heart" size={24} color={colors.error} />;
      case 1: // PostComment
        return <Ionicons name="chatbubble" size={24} color={colors.info} />;
      case 2: // Follow
        return <Ionicons name="person-add" size={24} color={colors.primary} />;
      case 3: // System
        return <Ionicons name="information-circle" size={24} color={colors.warning} />;
      default:
        return <Ionicons name="notifications" size={24} color={colors.text.secondary} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Simple formatting
    if (diff < 60000) return 'Şimdi';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}dk`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}s`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: item.isRead ? colors.surface : colors.surfaceHighlight }
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.placeholderIcon, { backgroundColor: colors.background }]}>
            {getIcon()}
          </View>
        )}
        {item.imageUrl && (
          <View style={[styles.miniIconBadge, { backgroundColor: colors.surface }]}>
            {getIcon()}
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.body, !item.isRead && styles.unreadText, { color: colors.text.primary }]}>
          {item.body}
        </Text>
        <Text style={[styles.time, { color: colors.text.tertiary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {!item.isRead && (
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
};

export const NotificationItem = React.memo(NotificationItemComponent);
NotificationItem.displayName = 'NotificationItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  body: {
    ...typography.body2,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  time: {
    ...typography.caption,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
});
