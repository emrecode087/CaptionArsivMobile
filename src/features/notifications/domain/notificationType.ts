import { NotificationItem } from './types';

export type NotificationCategory = 'system' | 'postLike' | 'postComment' | 'follow';

const textContains = (text: string, value: string) => text.toLowerCase().includes(value);

export const resolveNotificationCategory = (
  notification: Pick<NotificationItem, 'type' | 'title' | 'body'> & { type?: number | string }
): NotificationCategory => {
  const { type, title, body } = notification;

  if (typeof type === 'number') {
    switch (type) {
      case 1:
        return 'postLike';
      case 2:
        return 'postComment';
      case 3:
        return 'follow';
      default:
        return 'system';
    }
  }

  if (typeof type === 'string') {
    const normalized = String(type).toLowerCase();
    if (normalized.includes('like')) return 'postLike';
    if (normalized.includes('comment')) return 'postComment';
    if (normalized.includes('follow')) return 'follow';
  }

  const hint = `${title ?? ''} ${body ?? ''}`;
  const hintText = hint.toString().toLowerCase();
  if (textContains(hintText, 'beğen') || textContains(hintText, 'begen')) return 'postLike';
  if (textContains(hintText, 'yorum')) return 'postComment';
  if (textContains(hintText, 'takip')) return 'follow';

  return 'system';
};
