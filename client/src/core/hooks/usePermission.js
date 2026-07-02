import { useAuthStore } from '../store/authStore.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function usePermission() {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  const currentRole = currentWorkspace?.members?.find(
    (m) =>
      (m.userId?._id ?? m.userId?.toString()) ===
      (user?.id ?? user?._id?.toString()),
  )?.role;

  function hasRole(allowedRoles) {
    if (!currentRole) return false;
    return allowedRoles.includes(currentRole);
  }

  function hasMinRole(minRole) {
    if (!currentRole) return false;
    return (
      (ROLE_HIERARCHY[currentRole] ?? 0) >=
      (ROLE_HIERARCHY[minRole] ?? 0)
    );
  }

  function isOwner() {
    return currentRole === 'owner';
  }

  return { currentRole, hasRole, hasMinRole, isOwner };
}
