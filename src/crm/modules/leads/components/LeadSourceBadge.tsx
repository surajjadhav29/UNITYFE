import type { LeadSource } from '../../../types/crm.types';

const SOURCE_STYLE: Record<string, string> = {
  OLX: 'ld-src-olx',
  Cars24: 'ld-src-cars24',
  CarWale: 'ld-src-carwale',
  Website: 'ld-src-web',
  'Phone Call': 'ld-src-phone',
  'Walk-in': 'ld-src-walk',
  WhatsApp: 'ld-src-wa',
  Facebook: 'ld-src-fb',
  Instagram: 'ld-src-ig',
  Referral: 'ld-src-ref',
  Other: 'ld-src-other',
};

export function LeadSourceBadge({ source }: { source: LeadSource | string }) {
  const cls = SOURCE_STYLE[source] ?? 'ld-src-other';
  return <span className={`ld-src ${cls}`}>{source}</span>;
}
