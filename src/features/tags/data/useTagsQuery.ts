import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/core/types/api';
import { fetchTags, fetchRelatedTags, createTag, updateTag, deleteTag } from './tagsApi';
import type { Tag, CreateTagDto, UpdateTagDto } from '../domain/types';

export const tagsQueryKeys = {
  all: ['tags'] as const,
  related: (tagName: string) => [...tagsQueryKeys.all, 'related', tagName] as const,
};

export const useTagsQuery = () => {
  return useQuery({
    queryKey: tagsQueryKeys.all,
    queryFn: fetchTags,
  });
};

export const useRelatedTagsQuery = (tagName: string) => {
  return useQuery({
    queryKey: tagsQueryKeys.related(tagName),
    queryFn: () => fetchRelatedTags(tagName),
    enabled: !!tagName,
  });
};

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Tag, ApiError, CreateTagDto>({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKeys.all });
    },
  });
};

export const useUpdateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Tag, ApiError, { id: string; data: UpdateTagDto }>({
    mutationFn: ({ id, data }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKeys.all });
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKeys.all });
    },
  });
};
