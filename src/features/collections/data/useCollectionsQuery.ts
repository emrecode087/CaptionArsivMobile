import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from './collectionsApi';
import { CreateCollectionRequest, UpdateCollectionRequest, AddPostToCollectionRequest, Collection } from '../domain/types';

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

export const useLikeCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.likeCollection(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['collections'] });

      // Snapshot previous value
      const previousPublic = queryClient.getQueryData(['collections', 'public']);
      const previousMy = queryClient.getQueryData(['collections', 'my']);

      // Optimistically update public collections
      queryClient.setQueryData(['collections', 'public'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((col: Collection) =>
            col.id === id
              ? { ...col, isLiked: true, likeCount: (col.likeCount || 0) + 1 }
              : col
          ),
        };
      });

      // Optimistically update my collections
      queryClient.setQueryData(['collections', 'my'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((col: Collection) =>
            col.id === id
              ? { ...col, isLiked: true, likeCount: (col.likeCount || 0) + 1 }
              : col
          ),
        };
      });

      return { previousPublic, previousMy };
    },
    onError: (err, id, context) => {
      if (context?.previousPublic) {
        queryClient.setQueryData(['collections', 'public'], context.previousPublic);
      }
      if (context?.previousMy) {
        queryClient.setQueryData(['collections', 'my'], context.previousMy);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useUnlikeCollectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.unlikeCollection(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['collections'] });

      const previousPublic = queryClient.getQueryData(['collections', 'public']);
      const previousMy = queryClient.getQueryData(['collections', 'my']);

      queryClient.setQueryData(['collections', 'public'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((col: Collection) =>
            col.id === id
              ? { ...col, isLiked: false, likeCount: Math.max(0, (col.likeCount || 0) - 1) }
              : col
          ),
        };
      });

      queryClient.setQueryData(['collections', 'my'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((col: Collection) =>
            col.id === id
              ? { ...col, isLiked: false, likeCount: Math.max(0, (col.likeCount || 0) - 1) }
              : col
          ),
        };
      });

      return { previousPublic, previousMy };
    },
    onError: (err, id, context) => {
      if (context?.previousPublic) {
        queryClient.setQueryData(['collections', 'public'], context.previousPublic);
      }
      if (context?.previousMy) {
        queryClient.setQueryData(['collections', 'my'], context.previousMy);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};
