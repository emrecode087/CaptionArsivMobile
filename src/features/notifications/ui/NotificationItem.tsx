import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { resolveNotificationCategory } from '../domain/notificationType';
import { NotificationItem as NotificationItemType } from '../domain/types';

interface NotificationItemProps {
  item: NotificationItemType;
  onPress: (item: NotificationItemType) => void;
}

const NotificationItemComponent = ({ item, onPress }: NotificationItemProps) => {
  const { colors } = useTheme();
  const category = resolveNotificationCategory(item);

  const getIcon = () => {
    switch (category) {
      case 'postLike':
        return <Ionicons name="heart" size={20} color={colors.error} />;
      case 'postComment':
        return <Ionicons name="chatbubble-ellipses" size={20} color={colors.info} />;
      case 'follow':
        return <Ionicons name="person-add" size={20} color={colors.primary} />;
      default:
        return <Ionicons name="notifications" size={20} color={colors.text.secondary} />;
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
        { 
          backgroundColor: item.isRead ? colors.surface : colors.surfaceHighlight,
          shadowColor: colors.shadow,
        }
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.iconContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.placeholderIcon, { backgroundColor: colors.surfaceHighlight }]}>
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.lg,
  },
  placeholderIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  body: {
    ...typography.body2,
    marginBottom: 2,
    textAlign: 'left',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  time: {
    ...typography.small,
    textAlign: 'left',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.sm,
  },
});
