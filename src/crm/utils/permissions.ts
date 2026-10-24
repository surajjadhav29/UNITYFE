import type { CrmUser, Lead, StockVehicle } from '../types/crm.types';

export function roleLabel(role: CrmUser['role']): string {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'manager':
      return 'Manager';
    case 'sales':
      return 'Sales';
    case 'staff':
      return 'Staff';
    default:
      return role;
  }
}

export function isTeamLead(user: CrmUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'manager';
}

export function isSalesTeam(user: CrmUser | null): boolean {
  return user?.role === 'sales' || user?.role === 'staff' || user?.role === 'manager';
}

export function canManageUsers(user: CrmUser | null): boolean {
  return user?.role === 'admin' && user.status === 'active';
}

export function canManageSettings(user: CrmUser | null): boolean {
  return user?.role === 'admin' && user.status === 'active';
}

export function canBulkActions(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'manager';
}

export function canDeleteLeads(user: CrmUser | null): boolean {
  return user?.role === 'admin' && user.status === 'active';
}

export function canCreateLead(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'manager' || user.role === 'sales';
}

export function canImportLeads(user: CrmUser | null): boolean {
  return canCreateLead(user);
}

export function canExportLeads(user: CrmUser | null): boolean {
  return isTeamLead(user);
}

export function canViewReports(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'manager' || user.role === 'sales';
}

export function canManageStock(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'manager';
}

export function canViewVehicleCosts(user: CrmUser | null): boolean {
  return canManageStock(user);
}

export function canManageBookings(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'manager' || user.role === 'sales';
}

export function canViewLead(user: CrmUser | null, lead: Lead): boolean {
  if (!user || user.status !== 'active') return false;
  if (isTeamLead(user)) return true;
  return lead.assignedStaffId === user.id;
}

export function canEditLead(user: CrmUser | null, lead: Lead): boolean {
  return canViewLead(user, lead);
}

export function filterLeadsForUser(user: CrmUser | null, leads: Lead[]): Lead[] {
  if (!user || user.status !== 'active') return [];
  if (isTeamLead(user)) return leads;
  return leads.filter((lead) => lead.assignedStaffId === user.id);
}

export function filterAssignableStaff(users: CrmUser[]): CrmUser[] {
  return users.filter(
    (u) =>
      u.status === 'active' &&
      (u.role === 'sales' || u.role === 'staff' || u.role === 'manager'),
  );
}

export function shouldFilterDashboardToSelf(user: CrmUser | null): boolean {
  if (!user) return true;
  return !isTeamLead(user);
}

export function canAssignToUser(assignee: CrmUser | undefined): boolean {
  return Boolean(assignee && assignee.status === 'active' && assignee.role !== 'admin');
}

export function filterVehiclesForUser(
  _user: CrmUser | null,
  vehicles: StockVehicle[],
): StockVehicle[] {
  return vehicles;
}
