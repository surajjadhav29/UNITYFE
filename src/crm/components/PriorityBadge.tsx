import type { LeadPriority } from '../types/crm.types';
import { isHotPriority } from '../utils/followUpDue';

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  if (priority === 'Hot') {
    return <span className="crm-priority crm-priority-hot">Hot</span>;
  }
  if (priority === 'Warm') {
    return <span className="crm-priority crm-priority-high">Warm</span>;
  }
  return <span className="crm-priority crm-priority-low">Cold</span>;
}

export function LeadPriorityDot({ priority }: { priority: LeadPriority }) {
  if (!isHotPriority(priority)) return null;
  return (
    <span className="crm-priority-dot" title="Hot priority" aria-hidden />
  );
}
