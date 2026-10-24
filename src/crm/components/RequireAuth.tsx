import { Navigate, useLocation } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import type { ReactNode } from 'react';
import { canManageUsers, canViewReports } from '../utils/permissions';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useCrm();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { currentUser } = useCrm();
  if (!canManageUsers(currentUser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

export function RequireReports({ children }: { children: ReactNode }) {
  const { currentUser } = useCrm();
  if (!canViewReports(currentUser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}
