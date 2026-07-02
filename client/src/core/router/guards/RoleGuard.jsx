import { Navigate, Outlet } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission.js';

export function RoleGuard({ allowedRoles }) {
  const { hasRole } = usePermission();

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
