import type { LeadSource, LeadStatus, LostReason } from './types/crm.types';

export const LEAD_SOURCES: LeadSource[] = [
  'Phone',
  'WhatsApp',
  'Website',
  'Walk-in',
  'Facebook',
  'Instagram',
  'Referral',
  'Other',
];

export const LEAD_STATUSES: LeadStatus[] = [
  'New Lead',
  'Contacted',
  'Interested',
  'Follow-up Required',
  'Visit Scheduled',
  'Negotiation',
  'Booking',
  'Converted / Sold',
  'Lost',
  'On Hold',
];

export const LOST_REASONS: LostReason[] = [
  'Purchased elsewhere',
  'Price or budget issue',
  'No response after agreed attempts',
  'Not interested',
  'Purchase postponed or cancelled',
  'Vehicle requirement unavailable',
  'Other',
];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  'New Lead': '#2563eb',
  Contacted: '#0891b2',
  Interested: '#059669',
  'Follow-up Required': '#d97706',
  'Visit Scheduled': '#7c3aed',
  Negotiation: '#db2777',
  Booking: '#0d9488',
  'Converted / Sold': '#16a34a',
  Lost: '#dc2626',
  'On Hold': '#64748b',
};

export const CRM_STORAGE_KEY = 'unity-crm-v1';
export const CRM_SESSION_KEY = 'unity-crm-session';
