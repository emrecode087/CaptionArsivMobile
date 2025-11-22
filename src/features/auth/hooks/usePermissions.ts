import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  
  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return user.roles.some(role => roles.includes(role));
  };

  const isAdminOrModerator = hasRole(['SuperAdmin', 'Moderator']);

  return {
    canManageCategories: isAdminOrModerator,
    canCreatePost: isAdminOrModerator,
    canManageUsers: hasRole(['SuperAdmin']),
  };
};
