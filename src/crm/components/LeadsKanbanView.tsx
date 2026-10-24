import { useMemo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { STATUS_COLORS } from '../constants';
import type { Lead, LeadStatus } from '../types/crm.types';
import { formatLeadBudget } from '../utils/leadFormat';
import { LeadAvatar } from './leads/LeadAvatar';
import { LeadSourceBadge } from './leads/LeadSourceBadge';
import { LeadPriorityDropdown } from './LeadPriorityDropdown';
import type { LeadPriority } from '../types/crm.types';
import { isOverdue } from '../utils/followUpDue';

const KANBAN_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Visit/Test Drive Scheduled',
  'Test Drive Completed',
  'Negotiation',
  'Booking',
  'Won',
  'Lost',
];

interface LeadsKanbanViewProps {
  leads: Lead[];
  getStaffName: (staffId: string | null) => string;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onPriorityChange?: (leadId: string, priority: LeadPriority) => void;
  bulkSelect?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (leadId: string) => void;
  onSelectLead?: (lead: Lead) => void;
  selectedLeadId?: string | null;
}

export function LeadsKanbanView({
  leads,
  getStaffName,
  onStatusChange,
  onPriorityChange,
  bulkSelect = false,
  selectedIds = [],
  onToggleSelect,
  onSelectLead,
  selectedLeadId,
}: LeadsKanbanViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<LeadStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const s of KANBAN_STATUSES) map.set(s, []);
    for (const lead of leads) {
      const col = KANBAN_STATUSES.includes(lead.status) ? lead.status : 'New';
      map.get(col)!.push(lead);
    }
    return map;
  }, [leads]);

  function onDragStart(leadId: string, event: DragEvent) {
    setDraggingId(leadId);
    event.dataTransfer.setData('text/plain', leadId);
    event.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd() {
    setDraggingId(null);
    setOverColumn(null);
  }

  function onColumnDragOver(status: LeadStatus, event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setOverColumn(status);
  }

  function onColumnDrop(status: LeadStatus, event: DragEvent) {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('text/plain');
    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== status) {
      onStatusChange(leadId, status);
    }
    setDraggingId(null);
    setOverColumn(null);
  }

  return (
    <div className="ld-kanban-scroll" role="region" aria-label="Leads kanban board">
      <div className="ld-kanban-board">
        {KANBAN_STATUSES.map((status) => {
          const columnLeads = byStatus.get(status) ?? [];
          const isOver = overColumn === status;
          return (
            <div
              key={status}
              className={`ld-kanban-col${isOver ? ' ld-kanban-col-over' : ''}`}
              onDragOver={(e) => onColumnDragOver(status, e)}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => onColumnDrop(status, e)}
            >
              <header
                className="ld-kanban-col-head"
                style={{ borderTopColor: STATUS_COLORS[status] }}
              >
                <span>{status}</span>
                <span>{columnLeads.length}</span>
              </header>
              <div className="ld-kanban-col-body">
                {columnLeads.length === 0 ? (
                  <p className="ld-kanban-drop-hint">Drop leads here</p>
                ) : (
                  columnLeads.map((lead) => {
                    const overdue =
                      lead.nextFollowUpAt &&
                      isOverdue(lead.nextFollowUpAt) &&
                      !['Won', 'Lost'].includes(lead.status);
                    const isDragging = draggingId === lead.id;
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      <article
                        key={lead.id}
                        className={`ld-kanban-card${isDragging ? ' ld-kanban-card-dragging' : ''}${isSelected ? ' ld-row-selected' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(lead.id, e)}
                        onDragEnd={onDragEnd}
                        onClick={() => onSelectLead?.(lead)}
                      >
                        <div className="ld-kanban-card-top">
                          {bulkSelect && onToggleSelect ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(lead.id)}
                              onChange={() => onToggleSelect(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${lead.id}`}
                            />
                          ) : (
                            <GripVertical size={16} className="crm-kanban-grip" aria-hidden />
                          )}
                          <LeadAvatar name={lead.customerName} size={32} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4>
                              <Link
                                to={`/admin/leads/${lead.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {lead.customerName}
                              </Link>
                            </h4>
                            <span className="ld-kanban-card-meta">{lead.id}</span>
                          </div>
                          {onPriorityChange ? (
                            <LeadPriorityDropdown
                              leadId={lead.id}
                              priority={lead.priority}
                              onChange={onPriorityChange}
                              stopDrag
                            />
                          ) : null}
                        </div>
                        <div style={{ marginBottom: '0.35rem' }}>
                          <LeadSourceBadge source={lead.source} />
                        </div>
                        <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem' }}>{lead.mobile}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                          {formatLeadBudget(lead)} · {getStaffName(lead.assignedStaffId)}
                        </p>
                        {lead.nextFollowUpAt ? (
                          <p
                            className={overdue ? 'ld-follow-due' : undefined}
                            style={{ margin: '0.35rem 0 0', fontSize: '0.75rem' }}
                          >
                            {overdue ? 'Overdue · ' : ''}
                            {new Date(lead.nextFollowUpAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
