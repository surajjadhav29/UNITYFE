import { type SyntheticEvent } from 'react';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import type { LeadStatus } from '../types/crm.types';
import { CrmPickMenu } from './CrmPickMenu';

interface LeadStatusDropdownProps {
  leadId: string;
  status: LeadStatus;
  onChange: (leadId: string, status: LeadStatus) => void;
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

  const options = LEAD_STATUSES.map((s) => ({
    value: s,
    label: s,
    color: STATUS_COLORS[s],
  }));

  return (
    <div onMouseDown={blockDrag} onPointerDown={blockDrag}>
      <CrmPickMenu
        value={status}
        options={options}
        size="status"
        ariaLabel={`Status for ${leadId}`}
        stopDrag={stopDrag}
        onChange={(next) => {
          if (next !== status) onChange(leadId, next);
        }}
      />
    </div>
  );
}
