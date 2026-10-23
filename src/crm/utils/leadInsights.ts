import { LEAD_STATUSES } from '../constants';
import type { CrmPersistedState, Lead, LeadSource, StockVehicle } from '../types/crm.types';
import { isOverdue, isToday } from './followUpDue';

export type AttentionReason =
  | 'new_uncontacted'
  | 'overdue_follow_up'
  | 'due_today'
  | 'stale_no_contact'
  | 'unassigned'
  | 'hot_new';

export interface NeedsAttentionItem {
  lead: Lead;
  reasons: AttentionReason[];
  priority: number;
}

const STALE_DAYS = 7;
const MS_DAY = 86400000;

function daysSince(iso: string | undefined, now = Date.now()): number {
  if (!iso) return 999;
  return Math.floor((now - new Date(iso).getTime()) / MS_DAY);
}

function isNewLead(lead: Lead, now = Date.now()): boolean {
  return daysSince(lead.createdAt, now) <= 1 && lead.status === 'New Lead';
}

export function getNeedsAttention(
  leads: Lead[],
  followUps: CrmPersistedState['followUps'],
  now = new Date(),
): NeedsAttentionItem[] {
  const nowMs = now.getTime();
  const map = new Map<string, NeedsAttentionItem>();

  function add(lead: Lead, reason: AttentionReason, priority: number) {
    const existing = map.get(lead.id);
    if (existing) {
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      existing.priority = Math.max(existing.priority, priority);
      return;
    }
    map.set(lead.id, { lead, reasons: [reason], priority });
  }

  for (const lead of leads) {
    if (['Converted / Sold', 'Lost'].includes(lead.status)) continue;

    if (!lead.assignedStaffId) add(lead, 'unassigned', 70);

    if (isNewLead(lead, nowMs) && !lead.lastContactAt) {
      add(lead, 'new_uncontacted', 90);
      if (lead.priority === 'Urgent' || lead.priority === 'High') {
        add(lead, 'hot_new', 95);
      }
    }

    if (lead.nextFollowUpAt) {
      if (isOverdue(lead.nextFollowUpAt, now)) add(lead, 'overdue_follow_up', 100);
      else if (isToday(lead.nextFollowUpAt, now)) add(lead, 'due_today', 85);
    }

    const lastTouch = lead.lastContactAt ?? lead.createdAt;
    if (daysSince(lastTouch, nowMs) >= STALE_DAYS && lead.status !== 'On Hold') {
      add(lead, 'stale_no_contact', 75);
    }
  }

  for (const f of followUps) {
    if (f.status !== 'Scheduled') continue;
    const lead = leads.find((l) => l.id === f.leadId);
    if (!lead || ['Converted / Sold', 'Lost'].includes(lead.status)) continue;
    if (isOverdue(f.scheduledAt, now)) add(lead, 'overdue_follow_up', 100);
    else if (isToday(f.scheduledAt, now)) add(lead, 'due_today', 85);
  }

  return [...map.values()].sort((a, b) => b.priority - a.priority);
}

export function attentionReasonLabel(reason: AttentionReason): string {
  switch (reason) {
    case 'new_uncontacted':
      return 'New — not contacted';
    case 'overdue_follow_up':
      return 'Overdue follow-up';
    case 'due_today':
      return 'Due today';
    case 'stale_no_contact':
      return `No contact ${STALE_DAYS}+ days`;
    case 'unassigned':
      return 'Unassigned';
    case 'hot_new':
      return 'Hot priority';
    default:
      return reason;
  }
}

export function getPipelineCounts(leads: Lead[]): { status: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of LEAD_STATUSES) counts.set(s, 0);
  for (const lead of leads) {
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
  }
  return LEAD_STATUSES.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }));
}

export function getSourceBreakdown(leads: Lead[]): { source: LeadSource; count: number }[] {
  const counts = new Map<LeadSource, number>();
  for (const lead of leads) {
    counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export function matchVehiclesForLead(
  lead: Lead,
  vehicles: StockVehicle[],
  limit = 5,
): StockVehicle[] {
  const available = vehicles.filter((v) => v.availability === 'Available');
  const budget = lead.budget;
  const pref = (lead.preferredCar ?? '').toLowerCase();
  const prefYear = lead.preferredYear;

  const scored = available.map((v) => {
    let score = 0;
    if (budget && v.sellingPrice <= budget * 1.08) score += 40;
    if (budget && v.sellingPrice <= budget) score += 20;
    if (pref && (`${v.brand} ${v.model}`.toLowerCase().includes(pref) || pref.includes(v.model.toLowerCase()))) {
      score += 35;
    }
    if (lead.fuelType && v.fuelType === lead.fuelType) score += 10;
    if (lead.transmission && v.transmission === lead.transmission) score += 10;
    if (prefYear) {
      const nums = prefYear.match(/\d{4}/g);
      if (nums?.length) {
        const min = Math.min(...nums.map(Number));
        const max = Math.max(...nums.map(Number));
        if (v.year >= min && v.year <= max + 1) score += 15;
      }
    }
    return { v, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.v);
}

export function stockDaysListed(vehicle: StockVehicle): number {
  return daysSince(vehicle.createdAt);
}

export function countLeadsForVehicle(vehicleId: string, leads: Lead[]): number {
  return leads.filter((l) => l.interestedVehicleId === vehicleId).length;
}

export function exportLeadsToCsv(leads: Lead[], getStaffName: (id: string | null) => string): string {
  const headers = [
    'Lead ID',
    'Customer',
    'Mobile',
    'Source',
    'Status',
    'Priority',
    'Staff',
    'Budget',
    'Preferred Car',
    'Last Contact',
    'Next Follow-up',
    'Created',
  ];
  const rows = leads.map((l) =>
    [
      l.id,
      l.customerName,
      l.mobile,
      l.source,
      l.status,
      l.priority,
      getStaffName(l.assignedStaffId),
      l.budget ?? '',
      l.preferredCar ?? '',
      l.lastContactAt ?? '',
      l.nextFollowUpAt ?? '',
      l.createdAt,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
