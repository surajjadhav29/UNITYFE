import type { LeadPriority, LeadSource, LeadStatus, LostReason } from './types/crm.types';

export const DEFAULT_LEAD_SOURCES: LeadSource[] = [
  'OLX',
  'Cars24',
  'CarWale',
  'Website',
  'Phone Call',
  'Walk-in',
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Referral',
  'Other',
];

export const LEAD_SOURCES = DEFAULT_LEAD_SOURCES;

export const DEFAULT_LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Visit/Test Drive Scheduled',
  'Test Drive Completed',
  'Negotiation',
  'Booking',
  'Won',
  'Lost',
  'On Hold',
];

export const LEAD_STATUSES = DEFAULT_LEAD_STATUSES;

export const TERMINAL_LEAD_STATUSES: LeadStatus[] = ['Won', 'Lost'];

export const LOST_REASONS: LostReason[] = [
  'Purchased elsewhere',
  'Price or budget issue',
  'No response after agreed attempts',
  'Not interested',
  'Purchase postponed or cancelled',
  'Vehicle requirement unavailable',
  'Other',
];

export const LEAD_PRIORITIES: LeadPriority[] = ['Hot', 'Warm', 'Cold'];

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  Hot: '#e11d48',
  Warm: '#d97706',
  Cold: '#64748b',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  New: '#2563eb',
  Contacted: '#0891b2',
  Qualified: '#059669',
  'Visit/Test Drive Scheduled': '#7c3aed',
  'Test Drive Completed': '#6366f1',
  Negotiation: '#db2777',
  Booking: '#0d9488',
  Won: '#16a34a',
  Lost: '#dc2626',
  'On Hold': '#64748b',
};

export const CRM_STORAGE_KEY = 'unity-crm-v5';
export const CRM_STORAGE_KEY_LEGACY = 'unity-crm-v1';
export const CRM_SESSION_KEY = 'unity-crm-session';
