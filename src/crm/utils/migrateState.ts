import { createDefaultSettings } from './defaultSettings';
import type {
  CrmPersistedState,
  CrmPersistedStateV1,
  FollowUp,
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
} from '../types/crm.types';

const STATUS_MAP: Record<string, LeadStatus> = {
  'New Lead': 'New',
  Contacted: 'Contacted',
  Interested: 'Qualified',
  'Follow-up Required': 'Qualified',
  'Visit Scheduled': 'Visit/Test Drive Scheduled',
  Negotiation: 'Negotiation',
  Booking: 'Booking',
  'Converted / Sold': 'Won',
  Lost: 'Lost',
  'On Hold': 'On Hold',
};

const PRIORITY_MAP: Record<string, LeadPriority> = {
  Urgent: 'Hot',
  High: 'Hot',
  Medium: 'Warm',
  Low: 'Cold',
};

const SOURCE_MAP: Record<string, LeadSource> = {
  Phone: 'Phone Call',
  'Walk-in': 'Walk-in',
};

function migrateLead(lead: Lead): Lead {
  const status =
    STATUS_MAP[lead.status as string] ?? (lead.status as LeadStatus);
  const priority =
    PRIORITY_MAP[lead.priority as string] ?? (lead.priority as LeadPriority);
  let source = lead.source as LeadSource;
  if (SOURCE_MAP[lead.source as string]) {
    source = SOURCE_MAP[lead.source as string];
  }
  const budgetMax = lead.budgetMax ?? lead.budget;
  return {
    ...lead,
    status,
    priority,
    source,
    budgetMax,
    budget: budgetMax,
  };
}

function migrateFollowUp(fu: FollowUp): FollowUp {
  const raw = fu.status as string;
  const status =
    raw === 'Scheduled' || raw === 'Rescheduled'
      ? 'Pending'
      : raw === 'Completed'
        ? 'Completed'
        : raw === 'Cancelled'
          ? 'Cancelled'
          : 'Pending';
  return { ...fu, status };
}

export function migrateV1ToV2(raw: CrmPersistedStateV1): CrmPersistedState {
  const users = raw.users.map((u) =>
    u.role === 'staff' ? u : u,
  );
  if (!users.some((u) => u.role === 'manager')) {
    users.push({
      id: 'user-manager',
      name: 'Anita Desai',
      email: 'manager@unityauto.com',
      phone: '9898989898',
      role: 'manager',
      status: 'active',
      password: 'manager123',
      createdAt: new Date().toISOString(),
    });
  }

  return {
    version: 2,
    users,
    leads: raw.leads.map(migrateLead),
    vehicles: raw.vehicles.map((v) => ({
      ...v,
      addedById: v.addedById ?? raw.users[0]?.id,
    })),
    followUps: raw.followUps.map(migrateFollowUp),
    appointments: [],
    bookings: [],
    activities: raw.activities,
    auditLogs: raw.auditLogs,
    settings: createDefaultSettings(),
    leadCounter: raw.leadCounter,
  };
}

export function normalizeLoadedState(parsed: unknown): CrmPersistedState {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalid');
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.version === 2) {
    const state = parsed as CrmPersistedState;
    return {
      ...state,
      settings: state.settings ?? createDefaultSettings(),
      appointments: state.appointments ?? [],
      bookings: state.bookings ?? [],
    };
  }
  return migrateV1ToV2(parsed as CrmPersistedStateV1);
}
