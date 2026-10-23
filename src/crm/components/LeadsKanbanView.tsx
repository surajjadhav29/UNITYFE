import { useMemo, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical, Phone } from 'lucide-react';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import type { Lead, LeadStatus } from '../types/crm.types';
import { formatINR } from '../../utils/format';
import { LeadStatusDropdown } from './LeadStatusDropdown';
import { LeadWhatsAppButton } from './LeadWhatsAppButton';

interface LeadsKanbanViewProps {
  leads: Lead[];
  getStaffName: (staffId: string | null) => string;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  bulkSelect?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (leadId: string) => void;
  onWhatsApp?: (lead: Lead) => void;
}

export function LeadsKanbanView({
  leads,
  getStaffName,
  onStatusChange,
  bulkSelect = false,
  selectedIds = [],
  onToggleSelect,
  onWhatsApp,
}: LeadsKanbanViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<LeadStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const s of LEAD_STATUSES) map.set(s, []);
    for (const lead of leads) {
      const list = map.get(lead.status);
      if (list) list.push(lead);
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
    <div className="crm-kanban-scroll" role="region" aria-label="Leads board">
      <div className="crm-kanban-board">
        {LEAD_STATUSES.map((status) => {
          const columnLeads = byStatus.get(status) ?? [];
          const isOver = overColumn === status;
          return (
            <div
              key={status}
              className={`crm-kanban-column${isOver ? ' crm-kanban-column-over' : ''}`}
              onDragOver={(e) => onColumnDragOver(status, e)}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={(e) => onColumnDrop(status, e)}
            >
              <header
                className="crm-kanban-column-head"
                style={{ borderTopColor: STATUS_COLORS[status] }}
              >
                <span className="crm-kanban-column-title">{status}</span>
                <span className="crm-kanban-column-count">{columnLeads.length}</span>
              </header>
              <div className="crm-kanban-column-body">
                {columnLeads.length === 0 ? (
                  <p className="crm-kanban-placeholder">Drop leads here</p>
                ) : (
                  columnLeads.map((lead) => {
                    const overdue =
                      lead.nextFollowUpAt &&
                      new Date(lead.nextFollowUpAt).getTime() < Date.now() &&
                      !['Converted / Sold', 'Lost'].includes(lead.status);
                    const isDragging = draggingId === lead.id;
                    return (
                      <article
                        key={lead.id}
                        className={`crm-kanban-card${isDragging ? ' crm-kanban-card-dragging' : ''}${selectedIds.includes(lead.id) ? ' crm-kanban-card-selected' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(lead.id, e)}
                        onDragEnd={onDragEnd}
                      >
                        <div className="crm-kanban-card-top">
                          {bulkSelect && onToggleSelect ? (
                            <input
                              type="checkbox"
                              className="crm-kanban-check"
                              checked={selectedIds.includes(lead.id)}
                              onChange={() => onToggleSelect(lead.id)}
                              onMouseDown={(e) => e.stopPropagation()}
                              aria-label={`Select ${lead.id}`}
                            />
                          ) : (
                            <GripVertical
                              size={16}
                              className="crm-kanban-grip"
                              aria-hidden
                            />
                          )}
                          <div className="crm-kanban-card-meta">
                            <Link to={`/admin/leads/${lead.id}`} className="crm-kanban-name">
                              {lead.customerName}
                            </Link>
                            <span className="crm-kanban-id">{lead.id}</span>
                          </div>
                          {onWhatsApp ? (
                            <LeadWhatsAppButton
                              label={`Share car with ${lead.customerName}`}
                              onClick={() => onWhatsApp(lead)}
                              stopDrag
                            />
                          ) : null}
                        </div>
                        <div className="crm-kanban-card-row">
                          <Phone size={14} aria-hidden />
                          {lead.mobile}
                        </div>
                        <LeadStatusDropdown
                          leadId={lead.id}
                          status={lead.status}
                          onChange={onStatusChange}
                          stopDrag
                        />
                        <div className="crm-kanban-card-tags">
                          <span className="crm-kanban-tag">{lead.source}</span>
                          {lead.budget ? (
                            <span className="crm-kanban-tag">{formatINR(lead.budget)}</span>
                          ) : null}
                        </div>
                        <div className="crm-kanban-card-foot">
                          <span>{getStaffName(lead.assignedStaffId)}</span>
                          {lead.nextFollowUpAt ? (
                            <span className={overdue ? 'crm-kanban-overdue' : undefined}>
                              {overdue ? 'Overdue · ' : ''}
                              {new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          ) : null}
                        </div>
                        <Link
                          to={`/admin/leads/${lead.id}/edit`}
                          className="crm-kanban-edit"
                        >
                          Edit
                        </Link>
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
