import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';
import { postsQueryKeys } from '@/features/posts/data/usePostsQuery';

import { fetchCategories, createCategory, updateCategory, deleteCategory, followCategory, unfollowCategory, getCategoryById } from './categoriesApi';
import type { Category, CategoryListParams, CreateCategoryRequest, UpdateCategoryRequest, CategoryFollowStatus } from '../domain/types';

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

export const useFollowCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CategoryFollowStatus, ApiError, string>({
    mutationFn: followCategory,
    onSuccess: (data) => {
      // Optimistic update for list
      queryClient.setQueryData<Category[]>(categoriesQueryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((cat) =>
          cat.id === data.categoryId
            ? { ...cat, isFollowing: data.isFollowing, followerCount: data.followerCount }
            : cat
        );
      });

      // Optimistic update for detail
      queryClient.setQueryData<Category>(categoriesQueryKeys.detail(data.categoryId), (old) => {
        if (!old) return old;
        return { ...old, isFollowing: data.isFollowing, followerCount: data.followerCount };
      });

      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
};

export const useUnfollowCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CategoryFollowStatus, ApiError, string>({
    mutationFn: unfollowCategory,
    onSuccess: (data) => {
      // Optimistic update for list
      queryClient.setQueryData<Category[]>(categoriesQueryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((cat) =>
          cat.id === data.categoryId
            ? { ...cat, isFollowing: data.isFollowing, followerCount: data.followerCount }
            : cat
        );
      });

      // Optimistic update for detail
      queryClient.setQueryData<Category>(categoriesQueryKeys.detail(data.categoryId), (old) => {
        if (!old) return old;
        return { ...old, isFollowing: data.isFollowing, followerCount: data.followerCount };
      });

      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
};

export const useCategoryQuery = (
  id: string,
  options?: Omit<
    UseQueryOptions<Category, ApiError, Category, ReturnType<typeof categoriesQueryKeys.detail>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: categoriesQueryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
