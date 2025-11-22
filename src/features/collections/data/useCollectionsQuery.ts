import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from './collectionsApi';
import { CreateCollectionRequest, UpdateCollectionRequest, AddPostToCollectionRequest } from '../domain/types';

export const usePublicCollectionsQuery = (params?: { search?: string; ownerId?: string; includePosts?: boolean }) => {
  return useQuery({
    queryKey: ['collections', 'public', params],
    queryFn: () => collectionsApi.getPublicCollections(params),
  });
};

export const useUserCollectionsQuery = (userId: string, params?: { includePrivate?: boolean; includePosts?: boolean }) => {
  return useQuery({
    queryKey: ['collections', 'user', userId, params],
    queryFn: () => collectionsApi.getUserCollections(userId, params),
    enabled: !!userId,
  });
};

export const useMyCollectionsQuery = (params?: { includePosts?: boolean }) => {
  return useQuery({
    queryKey: ['collections', 'my', params],
    queryFn: () => collectionsApi.getMyCollections(params),
  });
};

export const useCollectionDetailQuery = (id: string, params?: { includePosts?: boolean }) => {
  return useQuery({
    queryKey: ['collections', 'detail', id, params],
    queryFn: () => collectionsApi.getCollectionById(id, params),
    enabled: !!id,
  });
};

export const useCreateCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionRequest) => collectionsApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'my'] });
    },
  });
};

export const useUpdateCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionRequest }) =>
      collectionsApi.updateCollection(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', variables.id] });
    },
  });
};

export const useDeleteCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      collectionsApi.deleteCollection(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'my'] });
    },
  });
};

export const useAddPostToCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddPostToCollectionRequest }) =>
      collectionsApi.addPostToCollection(id, data),
    onSuccess: (data, variables) => {
      // Invalidate detail query to show new post
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', variables.id] });
      // Invalidate my collections list to update post count
      // We use exact: false to match any query starting with ['collections', 'my']
      queryClient.invalidateQueries({ queryKey: ['collections', 'my'] });
    },
  });
};

export const useRemovePostFromCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, postId }: { id: string; postId: string }) =>
      collectionsApi.removePostFromCollection(id, postId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['collections', 'my'] });
    },
  });
};
