import { type SyntheticEvent } from 'react';
import { LEAD_PRIORITIES, PRIORITY_COLORS } from '../constants';
import type { LeadPriority } from '../types/crm.types';
import { CrmPickMenu } from './CrmPickMenu';

interface LeadPriorityDropdownProps {
  leadId: string;
  priority: LeadPriority;
  onChange: (leadId: string, priority: LeadPriority) => void;
  stopDrag?: boolean;
}

export function LeadPriorityDropdown({
  leadId,
  priority,
  onChange,
  stopDrag = false,
}: LeadPriorityDropdownProps) {
  function blockDrag(event: SyntheticEvent) {
    if (!stopDrag) return;
    event.stopPropagation();
  }

  const options = LEAD_PRIORITIES.map((p) => ({
    value: p,
    label: p,
    color: PRIORITY_COLORS[p],
  }));

  return (
    <div onMouseDown={blockDrag} onPointerDown={blockDrag}>
      <CrmPickMenu
        value={priority}
        options={options}
        size="priority"
        ariaLabel={`Priority for ${leadId}`}
        stopDrag={stopDrag}
        onChange={(next) => {
          if (next !== priority) onChange(leadId, next);
        }}
      />
    </div>
  );
}
