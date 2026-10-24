export const DASHBOARD_SECTION_ORDER_KEY = 'unity-dashboard-section-order';

export const DASHBOARD_SECTION_IDS = [
  'lead-trend',
  'lead-sources',
  'lead-status',
  'pipeline',
  'follow-ups',
  'appointments',
  'recent-vehicles',
  'stock-overview',
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTION_IDS)[number];

export function defaultDashboardSectionOrder(): DashboardSectionId[] {
  return [...DASHBOARD_SECTION_IDS];
}

export function loadDashboardSectionOrder(): DashboardSectionId[] {
  try {
    const raw = localStorage.getItem(DASHBOARD_SECTION_ORDER_KEY);
    if (!raw) return defaultDashboardSectionOrder();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultDashboardSectionOrder();
    const allowed = new Set<string>(DASHBOARD_SECTION_IDS);
    const merged: DashboardSectionId[] = [];
    for (const id of parsed) {
      if (typeof id === 'string' && allowed.has(id) && !merged.includes(id as DashboardSectionId)) {
        merged.push(id as DashboardSectionId);
      }
    }
    for (const id of DASHBOARD_SECTION_IDS) {
      if (!merged.includes(id)) merged.push(id);
    }
    return merged;
  } catch {
    return defaultDashboardSectionOrder();
  }
}

export function saveDashboardSectionOrder(order: DashboardSectionId[]): void {
  localStorage.setItem(DASHBOARD_SECTION_ORDER_KEY, JSON.stringify(order));
}

export function reorderDashboardSections(
  order: DashboardSectionId[],
  draggedId: DashboardSectionId,
  targetId: DashboardSectionId,
  placement: 'before' | 'after' = 'before',
): DashboardSectionId[] {
  if (draggedId === targetId) return order;
  const from = order.indexOf(draggedId);
  let to = order.indexOf(targetId);
  if (from < 0 || to < 0) return order;
  if (placement === 'after') to += 1;
  const next = [...order];
  next.splice(from, 1);
  if (from < to) to -= 1;
  next.splice(to, 0, draggedId);
  return next;
}

export function moveSectionToIndex(
  order: DashboardSectionId[],
  draggedId: DashboardSectionId,
  index: number,
): DashboardSectionId[] {
  const from = order.indexOf(draggedId);
  if (from < 0) return order;
  const next = [...order];
  next.splice(from, 1);
  const to = Math.max(0, Math.min(index, next.length));
  next.splice(to, 0, draggedId);
  return next;
}
