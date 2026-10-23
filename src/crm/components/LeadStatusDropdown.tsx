import { type SyntheticEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import type { LeadStatus } from '../types/crm.types';

interface LeadStatusDropdownProps {
  leadId: string;
  status: LeadStatus;
  onChange: (leadId: string, status: LeadStatus) => void;
  /** Stops kanban card drag when interacting with the control */
  stopDrag?: boolean;
}

export function LeadStatusDropdown({
  leadId,
  status,
  onChange,
  stopDrag = false,
}: LeadStatusDropdownProps) {
  function blockDrag(event: SyntheticEvent) {
    if (!stopDrag) return;
    event.stopPropagation();
  }

  return (
    <label
      className="crm-status-dropdown"
      style={{ backgroundColor: STATUS_COLORS[status] }}
      onMouseDown={blockDrag}
      onPointerDown={blockDrag}
      onDragStart={blockDrag}
    >
      <span className="crm-status-dropdown-sr">Change status for {leadId}</span>
      <select
        className="crm-status-dropdown-select"
        value={status}
        aria-label={`Status for ${leadId}`}
        onChange={(e) => {
          const next = e.target.value as LeadStatus;
          if (next !== status) onChange(leadId, next);
        }}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="crm-status-dropdown-icon" aria-hidden />
    </label>
  );
}
