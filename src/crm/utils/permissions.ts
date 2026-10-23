import type { CrmUser, Lead } from '../types/crm.types';

export function roleLabel(role: CrmUser['role']): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'sales':
      return 'Sales executive';
    case 'staff':
      return 'Staff';
    default:
      return role;
  }
}

export function isSalesTeam(user: CrmUser | null): boolean {
  return user?.role === 'sales' || user?.role === 'staff';
}

export function canManageUsers(user: CrmUser | null): boolean {
  return user?.role === 'admin' && user.status === 'active';
}

export function canBulkActions(user: CrmUser | null): boolean {
  return canManageUsers(user);
}

export function canCreateLead(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'sales';
}

export function canImportLeads(user: CrmUser | null): boolean {
  return canCreateLead(user);
}

export function canViewReports(user: CrmUser | null): boolean {
  if (!user || user.status !== 'active') return false;
  return user.role === 'admin' || user.role === 'sales';
}

export function canManageStock(user: CrmUser | null): boolean {
  return canManageUsers(user);
}

export function canViewLead(user: CrmUser | null, lead: Lead): boolean {
  if (!user || user.status !== 'active') return false;
  if (user.role === 'admin') return true;
  return lead.assignedStaffId === user.id;
}

export function canEditLead(user: CrmUser | null, lead: Lead): boolean {
  return canViewLead(user, lead);
}

export function filterLeadsForUser(user: CrmUser | null, leads: Lead[]): Lead[] {
  if (!user || user.status !== 'active') return [];
  if (user.role === 'admin') return leads;
  return leads.filter((lead) => lead.assignedStaffId === user.id);
}

export function filterAssignableStaff(users: CrmUser[]): CrmUser[] {
  return users.filter(
    (u) => u.status === 'active' && (u.role === 'sales' || u.role === 'staff'),
  );
}

export function shouldFilterDashboardToSelf(user: CrmUser | null): boolean {
  return Boolean(user && user.role !== 'admin');
}
