import type { Category } from './types';

export const sortCategories = (items: Category[]) =>
  [...items].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.name ?? '').localeCompare(b.name ?? '', 'tr', { sensitivity: 'base' });
  });
