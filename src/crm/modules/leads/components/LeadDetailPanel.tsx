import { Link } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Phone, StickyNote, X } from 'lucide-react';
import { useState } from 'react';
import type { Lead, LeadStatus } from '../../../types/crm.types';
import { useCrm } from '../../../context/CrmContext';
import { LeadAvatar } from './LeadAvatar';
import { LeadSourceBadge } from './LeadSourceBadge';
import { LeadStatusBadge } from '../../../components/StatusBadge';
import { PriorityBadge } from '../../../components/PriorityBadge';
import { LEAD_STATUSES } from '../../../constants';
import { formatLeadBudget } from '../../../utils/leadFormat';
import { filterAssignableStaff } from '../../../utils/permissions';

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const { state, updateLead, addActivity } = useCrm();
  const [note, setNote] = useState('');

  const vehicle = lead.interestedVehicleId
    ? state.vehicles.find((v) => v.id === lead.interestedVehicleId)
    : undefined;

  const notes = state.activities
    .filter((a) => a.leadId === lead.id && (a.type === 'note' || a.type === 'contact'))
    .slice(0, 6);

  const staffOptions = filterAssignableStaff(state.users);

  function saveNote() {
    const text = note.trim();
    if (!text) return;
    addActivity(lead.id, { type: 'note', title: 'Note added', detail: text });
    setNote('');
  }

  return (
    <aside className="ld-panel" aria-label={`Lead ${lead.id}`}>
      <header className="ld-panel-head">
        <div>
          <span className="ld-panel-id">{lead.id}</span>
          <button type="button" className="ld-panel-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="ld-panel-hero">
          <LeadAvatar name={lead.customerName} size={48} />
          <div>
            <h2>{lead.customerName}</h2>
            <PriorityBadge priority={lead.priority} />
          </div>
        </div>
        <p className="ld-panel-contact">{lead.mobile}</p>
        {lead.email ? <p className="ld-panel-contact">{lead.email}</p> : null}
        {lead.city ? <p className="ld-panel-muted">{lead.city}</p> : null}
        <div className="ld-panel-tags">
          <LeadSourceBadge source={lead.source} />
          <LeadStatusBadge status={lead.status} />
        </div>
      </header>

      <div className="ld-panel-actions">
        <a href={`tel:${lead.mobile}`} className="ld-panel-action">
          <Phone size={18} />
          Call
        </a>
        <a
          href={`https://wa.me/91${lead.mobile.replace(/\D/g, '').slice(-10)}`}
          target="_blank"
          rel="noreferrer"
          className="ld-panel-action"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>
        <button type="button" className="ld-panel-action" onClick={() => document.getElementById('ld-note-input')?.focus()}>
          <StickyNote size={18} />
          Note
        </button>
        <Link to={`/admin/leads/${lead.id}`} className="ld-panel-action">
          <MoreHorizontal size={18} />
          More
        </Link>
      </div>

      <section className="ld-panel-section">
        <h3>Lead details</h3>
        <dl className="ld-dl">
          <div>
            <dt>Interested vehicle</dt>
            <dd>{vehicle ? `${vehicle.brand} ${vehicle.model}` : lead.preferredCar ?? '—'}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>{formatLeadBudget(lead)}</dd>
          </div>
          <div>
            <dt>Fuel / transmission</dt>
            <dd>
              {[lead.fuelType, lead.transmission].filter(Boolean).join(' · ') || '—'}
            </dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{lead.purchaseTimeline ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="ld-panel-section">
        <h3>Assignment & status</h3>
        <label className="ld-field">
          Assigned to
          <select
            value={lead.assignedStaffId ?? ''}
            onChange={(e) =>
              updateLead(lead.id, { assignedStaffId: e.target.value || null })
            }
          >
            <option value="">Unassigned</option>
            {staffOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ld-field">
          Status
          <select
            value={lead.status}
            onChange={(e) => {
              const next = e.target.value as LeadStatus;
              const patch: Parameters<typeof updateLead>[1] = { status: next };
              if (next === 'Lost' && !lead.lostReason) patch.lostReason = 'Other';
              updateLead(lead.id, patch);
            }}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="ld-field">
          Next follow-up
          <input
            type="datetime-local"
            value={
              lead.nextFollowUpAt
                ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              updateLead(lead.id, {
                nextFollowUpAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
          />
        </label>
      </section>

      <section className="ld-panel-section">
        <h3>Notes</h3>
        <div className="ld-note-compose">
          <textarea
            id="ld-note-input"
            rows={2}
            placeholder="Add a note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="button" className="crm-btn crm-btn-primary crm-btn-sm" onClick={saveNote}>
            Save
          </button>
        </div>
        <ul className="ld-notes-list">
          {notes.length === 0 ? (
            <li className="ld-panel-muted">No notes yet.</li>
          ) : (
            notes.map((n) => (
              <li key={n.id}>
                <time>{new Date(n.createdAt).toLocaleString('en-IN')}</time>
                <p>{n.detail ?? n.title}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <footer className="ld-panel-foot">
        <Link to={`/admin/leads/${lead.id}/edit`} className="crm-btn crm-btn-secondary">
          Edit full record
        </Link>
      </footer>
    </aside>
  );
}
