import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';

import { fetchCategories, createCategory, updateCategory, deleteCategory } from './categoriesApi';
import type { Category, CategoryListParams, CreateCategoryRequest, UpdateCategoryRequest } from '../domain/types';

export const categoriesQueryKeys = {
  all: ['categories'] as const,
  list: (params?: CategoryListParams) => [...categoriesQueryKeys.all, params] as const,
  detail: (id: string) => [...categoriesQueryKeys.all, id] as const,
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

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<string, ApiError, CreateCategoryRequest>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<string, ApiError, { id: string; data: UpdateCategoryRequest }>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<string, ApiError, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
    },
  });
};
