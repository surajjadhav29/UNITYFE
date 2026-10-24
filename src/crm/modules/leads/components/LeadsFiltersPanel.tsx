import { useEffect, useState } from 'react';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../../constants';
import { Accordion, CheckboxRow, SideRail } from '../../../common/components';
import {
  LEAD_PRIORITY_OPTIONS,
  toggleFilterValue,
  type LeadsSheetFilters,
} from '../utils/leadsFilterUtils';
import type { CrmUser } from '../../../types/crm.types';

type SectionKey = 'sources' | 'statuses' | 'priorities' | 'staffIds';

interface LeadsFiltersPanelProps {
  open: boolean;
  onClose: () => void;
  draft: LeadsSheetFilters;
  onChange: (next: LeadsSheetFilters) => void;
  onApply: () => void;
  onClear: () => void;
  staffOptions: CrmUser[];
  showStaffFilter: boolean;
}

export function LeadsFiltersPanel({
  open,
  onClose,
  draft,
  onChange,
  onApply,
  onClear,
  staffOptions,
  showStaffFilter,
}: LeadsFiltersPanelProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    sources: true,
    statuses: false,
    priorities: false,
    staffIds: false,
  });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function patch(partial: Partial<LeadsSheetFilters>) {
    onChange({ ...draft, ...partial });
  }

  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <SideRail
      open={open}
      title="Filter leads"
      onClose={onClose}
      ariaLabel="Filter leads"
      footer={
        <>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onClear}>
            Clear all
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={onApply}>
            Apply filters
          </button>
        </>
      }
    >
      <div className="ld-filter-accordion-list">
        <Accordion
          title="Source"
          count={draft.sources.length}
          open={openSections.sources}
          onToggle={() => toggleSection('sources')}
        >
          <div className="ld-filter-checklist-flat">
          {LEAD_SOURCES.map((source) => (
            <CheckboxRow
              key={source}
              id={`ld-filter-source-${source}`}
              label={source}
              checked={draft.sources.includes(source)}
              onChange={() => patch({ sources: toggleFilterValue(draft.sources, source) })}
            />
          ))}
          </div>
        </Accordion>
        <Accordion
          title="Status"
          count={draft.statuses.length}
          open={openSections.statuses}
          onToggle={() => toggleSection('statuses')}
        >
          <div className="ld-filter-checklist-flat">
          {LEAD_STATUSES.map((status) => (
            <CheckboxRow
              key={status}
              id={`ld-filter-status-${status}`}
              label={status}
              checked={draft.statuses.includes(status)}
              onChange={() => patch({ statuses: toggleFilterValue(draft.statuses, status) })}
            />
          ))}
          </div>
        </Accordion>
        <Accordion
          title="Priority"
          count={draft.priorities.length}
          open={openSections.priorities}
          onToggle={() => toggleSection('priorities')}
        >
          <div className="ld-filter-checklist-flat">
          {LEAD_PRIORITY_OPTIONS.map((priority) => (
            <CheckboxRow
              key={priority}
              id={`ld-filter-priority-${priority}`}
              label={priority}
              checked={draft.priorities.includes(priority)}
              onChange={() =>
                patch({ priorities: toggleFilterValue(draft.priorities, priority) })
              }
            />
          ))}
          </div>
        </Accordion>
        {showStaffFilter ? (
          <Accordion
            title="Assigned to"
            count={draft.staffIds.length}
            open={openSections.staffIds}
            onToggle={() => toggleSection('staffIds')}
          >
            <div className="ld-filter-checklist-flat">
            {staffOptions.map((user) => (
              <CheckboxRow
                key={user.id}
                id={`ld-filter-staff-${user.id}`}
                label={user.name}
                checked={draft.staffIds.includes(user.id)}
                onChange={() =>
                  patch({ staffIds: toggleFilterValue(draft.staffIds, user.id) })
                }
              />
            ))}
            </div>
          </Accordion>
        ) : null}
      </div>
    </SideRail>
  );
}
