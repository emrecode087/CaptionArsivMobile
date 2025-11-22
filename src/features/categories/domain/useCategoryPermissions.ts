import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const useCategoryPermissions = () => {
  const user = useAuthStore((state) => state.user);
  
  const canManageCategories = user?.roles.some(role => ['SuperAdmin', 'Moderator'].includes(role)) ?? false;

  return {
    canCreate: canManageCategories,
    canUpdate: canManageCategories,
    canDelete: canManageCategories,
  };
};
