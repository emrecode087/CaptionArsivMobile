import { useMutation } from '@tanstack/react-query';
import { blocksApi } from './blocksApi';

export const useBlockUserMutation = () =>
  useMutation({
    mutationFn: blocksApi.blockUser,
  });

export const useUnblockUserMutation = () =>
  useMutation({
    mutationFn: blocksApi.unblockUser,
  });

export const useBlockTagMutation = () =>
  useMutation({
    mutationFn: blocksApi.blockTag,
  });

export const useUnblockTagMutation = () =>
  useMutation({
    mutationFn: blocksApi.unblockTag,
  });

export const useBlockCategoryMutation = () =>
  useMutation({
    mutationFn: blocksApi.blockCategory,
  });

export const useUnblockCategoryMutation = () =>
  useMutation({
    mutationFn: blocksApi.unblockCategory,
  });
