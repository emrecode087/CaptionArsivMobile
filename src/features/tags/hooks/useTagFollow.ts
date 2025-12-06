import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followTag, unfollowTag, fetchFollowedTags } from '../data/tagsApi';
import { tagsQueryKeys } from '../data/useTagsQuery';

export const useFollowedTagsQuery = () => {
  return useQuery({
    queryKey: [...tagsQueryKeys.all, 'following'],
    queryFn: fetchFollowedTags,
  });
};

export const useFollowTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...tagsQueryKeys.all, 'following'] });
    },
  });
};

export const useUnfollowTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...tagsQueryKeys.all, 'following'] });
    },
  });
};
