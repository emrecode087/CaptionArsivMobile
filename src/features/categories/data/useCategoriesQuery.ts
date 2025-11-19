import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';

import { fetchCategories } from './categoriesApi';
import type { Category, CategoryListParams } from '../domain/types';

export const categoriesQueryKeys = {
  all: ['categories'] as const,
  list: (params?: CategoryListParams) => [...categoriesQueryKeys.all, params] as const,
};

export const useCategoriesQuery = (
  params?: CategoryListParams,
  options?: Omit<
    UseQueryOptions<Category[], ApiError, Category[], ReturnType<typeof categoriesQueryKeys.list>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: categoriesQueryKeys.list(params),
    queryFn: () => fetchCategories(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
