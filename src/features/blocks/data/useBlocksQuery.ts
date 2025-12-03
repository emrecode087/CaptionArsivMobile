import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/core/types/api';
import { blocksApi } from './blocksApi';

export interface BlockedLists {
  users: { id: string; userName: string; profileImageUrl?: string | null }[];
  categories: { id: string; name: string }[];
  tags: string[];
}

export const blocksQueryKeys = {
  all: ['blocks'] as const,
};

export const useBlockedListQuery = () =>
  useQuery<BlockedLists, ApiError>({
    queryKey: blocksQueryKeys.all,
    queryFn: async () => {
      const res = await blocksApi.getBlocks();
      if (!res.isSuccess || !res.data) {
        throw new ApiError(res.message ?? 'Blok listesi alinamiadi', { errors: res.errors });
      }
      return res.data;
    },
  });

export const useUpdateBlockedCache = () => {
  const queryClient = useQueryClient();
  return (updater: (prev: BlockedLists | undefined) => BlockedLists | undefined) => {
    queryClient.setQueryData(blocksQueryKeys.all, updater);
  };
};
