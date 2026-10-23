import type { LeadPriority } from '../types/crm.types';
import { isHotPriority } from '../utils/followUpDue';

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  if (priority === 'Urgent') {
    return <span className="crm-priority crm-priority-hot">Hot</span>;
  }
  if (priority === 'High') {
    return <span className="crm-priority crm-priority-high">High</span>;
  }
  if (priority === 'Medium') {
    return <span className="crm-priority crm-priority-medium">Medium</span>;
  }
  return <span className="crm-priority crm-priority-low">Low</span>;
}

export function LeadPriorityDot({ priority }: { priority: LeadPriority }) {
  if (!isHotPriority(priority)) return null;
  return (
    <span
      className="crm-priority-dot"
      title={priority === 'Urgent' ? 'Hot customer' : 'High priority'}
      aria-hidden
    />
  );
}
