import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type UseInfiniteQueryOptions, type UseQueryOptions, type QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

import type { Post, PostsListParams, SearchPostsParams, CreatePostRequest, Comment } from '../domain/types';
import { fetchPosts, fetchSearchPosts, getPostById, createPost, likePost, unlikePost, fetchComments, createComment, deleteComment, fetchLikedPosts } from './postsApi';

export const postsQueryKeys = {
  all: ['posts'] as const,
  list: (params?: PostsListParams) => [...postsQueryKeys.all, params] as const,
  infiniteList: (params?: PostsListParams) => [...postsQueryKeys.all, 'infinite', params] as const,
  search: (params: SearchPostsParams) => [...postsQueryKeys.all, 'search', params] as const,
  liked: (userId?: string, includePrivate?: boolean, includeDeleted?: boolean) =>
    [...postsQueryKeys.all, 'liked', userId ?? 'me', includePrivate ?? true, includeDeleted ?? false] as const,
  detail: (id: string) => [...postsQueryKeys.all, 'detail', id] as const,
  comments: (postId: string) => [...postsQueryKeys.detail(postId), 'comments'] as const,
};

const updatePostListCaches = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: Post) => Post,
) => {
  queryClient.setQueriesData({ queryKey: postsQueryKeys.all }, (oldData: unknown) => {
    if (!oldData) return oldData;
    if (Array.isArray(oldData)) {
      return oldData.map((post: Post) => (post.id === postId ? updater(post) : post));
    }
    return oldData;
  });
};

const updatePostDetailCache = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: Post) => Post,
) => {
  queryClient.setQueryData(postsQueryKeys.detail(postId), (oldPost: Post | undefined) => {
    if (!oldPost) return oldPost;
    return updater(oldPost);
  });
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

export const usePostDetailQuery = (
  id: string,
  options?: Omit<UseQueryOptions<Post, ApiError, Post, ReturnType<typeof postsQueryKeys.detail>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: postsQueryKeys.detail(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
    ...options,
  });

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Post, ApiError, CreatePostRequest>({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
};

export const useLikePostMutation = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore.getState().user?.id;

  return useMutation<{ postId: string; isLiked: boolean; totalLikes: number }, ApiError, string>({
    mutationFn: likePost,
    onSuccess: (data) => {
      updatePostListCaches(queryClient, data.postId, (post) => ({
        ...post,
        isLikedByCurrentUser: true,
        likeCount: data.totalLikes,
      }));

      updatePostDetailCache(queryClient, data.postId, (post) => ({
        ...post,
        isLikedByCurrentUser: true,
        likeCount: data.totalLikes,
      }));

      queryClient.invalidateQueries({ queryKey: postsQueryKeys.liked(currentUserId) });
    },
    onError: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.detail(postId) });
    },
  });
};

export const useUnlikePostMutation = () => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore.getState().user?.id;

  return useMutation<{ postId: string; isLiked: boolean; totalLikes: number }, ApiError, string>({
    mutationFn: unlikePost,
    onSuccess: (data) => {
      updatePostListCaches(queryClient, data.postId, (post) => ({
        ...post,
        isLikedByCurrentUser: false,
        likeCount: data.totalLikes,
      }));

      updatePostDetailCache(queryClient, data.postId, (post) => ({
        ...post,
        isLikedByCurrentUser: false,
        likeCount: data.totalLikes,
      }));

      queryClient.invalidateQueries({ queryKey: postsQueryKeys.liked(currentUserId) });
    },
    onError: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.detail(postId) });
    },
  });
};

export const useCommentsQuery = (postId: string) =>
  useQuery({
    queryKey: postsQueryKeys.comments(postId),
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Comment, ApiError, { postId: string; content: string }>({
    mutationFn: createComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.detail(variables.postId) }); // Update comment count
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all }); // Update comment count in list
    },
  });
};

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<string, ApiError, { postId: string; commentId: string }>({
    mutationFn: deleteComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.comments(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postsQueryKeys.all });
    },
  });
};

export const useInfinitePostsQuery = (
  params?: PostsListParams,
  options?: Omit<
    UseInfiniteQueryOptions<Post[], ApiError, Post[], Post[], ReturnType<typeof postsQueryKeys.infiniteList>>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >,
) => {
  const pageSize = params?.pageSize ?? 20;
  const initialPage = params?.page ?? 1;

  return useInfiniteQuery({
    queryKey: postsQueryKeys.infiniteList({ ...params, page: undefined, pageSize }),
    queryFn: ({ pageParam = initialPage }) =>
      fetchPosts({
        ...params,
        page: pageParam,
        pageSize,
      }),
    initialPageParam: initialPage,
    getNextPageParam: (lastPage, allPages) => (lastPage.length >= pageSize ? allPages.length + initialPage : undefined),
    ...options,
  });
};

export const useInfiniteSearchPosts = (
  params: SearchPostsParams,
  options?: Omit<
    UseInfiniteQueryOptions<Post[], ApiError, Post[], Post[], ReturnType<typeof postsQueryKeys.search>>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >,
) => {
  const pageSize = params.pageSize ?? 20;
  const initialPage = params.page ?? 1;

  return useInfiniteQuery({
    queryKey: postsQueryKeys.search({ ...params, page: undefined }),
    queryFn: ({ pageParam = initialPage }) =>
      fetchSearchPosts({
        ...params,
        page: pageParam,
        pageSize,
      }),
    initialPageParam: initialPage,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= pageSize ? allPages.length + initialPage : undefined,
    ...options,
  });
};

export const useLikedPostsQuery = (
  params: { userId?: string; includePrivate?: boolean; includeDeleted?: boolean },
  options?: Omit<UseQueryOptions<Post[], ApiError, Post[], ReturnType<typeof postsQueryKeys.liked>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: postsQueryKeys.liked(params?.userId, params?.includePrivate ?? true, params?.includeDeleted ?? false),
    queryFn: () =>
      fetchLikedPosts({
        userId: params.userId as string,
        includePrivate: params.includePrivate ?? true,
        includeDeleted: params.includeDeleted ?? false,
      }),
    ...options,
    enabled: !!params?.userId && (options?.enabled ?? true),
  });
