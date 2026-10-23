import type { FollowUp, Lead } from '../types/crm.types';

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(iso: string, now = new Date()): boolean {
  return isSameCalendarDay(new Date(iso), now);
}

export function isOverdue(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return d.getTime() < now.getTime() && !isSameCalendarDay(d, now);
}

export function isHotPriority(priority: Lead['priority']): boolean {
  return priority === 'Urgent' || priority === 'High';
}

export interface DueFollowUpItem {
  followUp: FollowUp;
  lead: Lead;
  kind: 'today' | 'overdue' | 'upcoming';
}

export function getDueFollowUpsForLeads(
  followUps: FollowUp[],
  leads: Lead[],
  userId: string | undefined,
  now = new Date(),
): DueFollowUpItem[] {
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  return followUps
    .filter((f) => f.status === 'Scheduled')
    .filter((f) => !userId || f.assignedStaffId === userId)
    .map((followUp) => {
      const lead = leadMap.get(followUp.leadId);
      if (!lead) return null;
      const kind = isOverdue(followUp.scheduledAt, now)
        ? 'overdue'
        : isToday(followUp.scheduledAt, now)
          ? 'today'
          : 'upcoming';
      return { followUp, lead, kind };
    })
    .filter((x): x is DueFollowUpItem => x !== null)
    .sort(
      (a, b) =>
        new Date(a.followUp.scheduledAt).getTime() - new Date(b.followUp.scheduledAt).getTime(),
    );
}

export function addDaysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
