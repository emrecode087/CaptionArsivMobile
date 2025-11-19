import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';

import type { Post, PostsListParams } from '../domain/types';
import { fetchPosts } from './postsApi';

export const postsQueryKeys = {
  all: ['posts'] as const,
  list: (params?: PostsListParams) => [...postsQueryKeys.all, params] as const,
};

export const usePostsQuery = (
  params?: PostsListParams,
  options?: Omit<UseQueryOptions<Post[], ApiError, Post[], ReturnType<typeof postsQueryKeys.list>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: postsQueryKeys.list(params),
    queryFn: () => fetchPosts(params),
    ...options,
  });
