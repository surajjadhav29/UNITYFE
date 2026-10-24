import { useMemo, useState, type FormEvent } from 'react';
import { Ban, CalendarClock, CheckCircle2, Phone } from 'lucide-react';
import { LEAD_PRIORITIES, LEAD_STATUSES, LOST_REASONS } from '../constants';
import type {
  FollowUpType,
  Lead,
  LeadPriority,
  LeadStatus,
  LostReason,
} from '../types/crm.types';
import type { LogContactInput } from '../context/CrmContext';
import { addDaysFromNow } from '../utils/followUpDue';

const CONTACT_TYPES: FollowUpType[] = ['Call', 'WhatsApp', 'Visit', 'Email', 'Other'];

type CallOutcome = 'schedule' | 'purchased' | 'do_not_call';

const DAY_PRESETS: { value: string; label: string }[] = [
  { value: '0', label: 'Today' },
  { value: '1', label: '1 day' },
  { value: '2', label: '2 days' },
  { value: '3', label: '3 days' },
  { value: '7', label: '1 week' },
  { value: '14', label: '2 weeks' },
  { value: 'custom', label: 'Pick date' },
];

interface LeadContactLogProps {
  lead: Lead;
  staffOptions: { id: string; name: string }[];
  showAssign: boolean;
  openFollowUpId?: string;
  onSubmit: (input: LogContactInput) => { ok: true } | { ok: false; error: string };
  onSuccess: (summary: string) => void;
}

export function LeadContactLog({
  lead,
  staffOptions,
  showAssign,
  openFollowUpId,
  onSubmit,
  onSuccess,
}: LeadContactLogProps) {
  const [contactType, setContactType] = useState<FollowUpType>('Call');
  const [clientResponse, setClientResponse] = useState('');
  const [priority, setPriority] = useState<LeadPriority>(lead.priority);
  const [budget, setBudget] = useState(lead.budget?.toString() ?? '');
  const [newStatus, setNewStatus] = useState<LeadStatus | ''>('');
  const [assignStaffId, setAssignStaffId] = useState(lead.assignedStaffId ?? '');
  const [outcome, setOutcome] = useState<CallOutcome>('schedule');
  const [nextDays, setNextDays] = useState('2');
  const [customDate, setCustomDate] = useState('');
  const [nextTime, setNextTime] = useState('10:00');
  const [lostReason, setLostReason] = useState<LostReason>('Purchased elsewhere');
  const [completeOpen, setCompleteOpen] = useState(Boolean(openFollowUpId));
  const [error, setError] = useState('');

  const nextFollowUpPreview = useMemo(() => {
    if (outcome !== 'schedule') return null;
    const [h, m] = nextTime.split(':').map(Number);
    if (nextDays === 'custom') {
      if (!customDate) return null;
      const d = new Date(`${customDate}T${nextTime || '10:00'}:00`);
      if (Number.isNaN(d.getTime())) return null;
      return d;
    }
    const d = new Date(addDaysFromNow(Number(nextDays) || 0));
    d.setHours(h || 10, m || 0, 0, 0);
    return d;
  }, [outcome, nextDays, nextTime, customDate]);

  function onFormSubmit(event: FormEvent) {
    event.preventDefault();
    const response = clientResponse.trim();
    if (!response) {
      setError('Write what the customer said (feedback / discussion).');
      return;
    }

    let nextFollowUpAt: string | undefined;
    let status: LeadStatus | undefined = newStatus || undefined;
    let stopFollowUps = false;

    if (outcome === 'schedule') {
      if (!nextFollowUpPreview) {
        setError('Choose when to call next (days or a date).');
        return;
      }
      nextFollowUpAt = nextFollowUpPreview.toISOString();
      if (!status && lead.status === 'New') status = 'Contacted';
    } else if (outcome === 'purchased') {
      status = 'Won';
      stopFollowUps = true;
    } else {
      status = 'Lost';
      stopFollowUps = true;
    }

    const result = onSubmit({
      leadId: lead.id,
      contactType,
      clientResponse: response,
      newStatus: status,
      assignStaffId: showAssign ? assignStaffId || null : undefined,
      nextFollowUpAt,
      nextFollowUpType: contactType,
      completeScheduledFollowUpId:
        completeOpen && openFollowUpId ? openFollowUpId : undefined,
      priority: priority !== lead.priority ? priority : undefined,
      budget: budget ? Number(budget) : undefined,
      lostReason: outcome === 'do_not_call' ? lostReason : undefined,
      stopFollowUps,
      markContacted: outcome === 'schedule',
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    setClientResponse('');
    setNewStatus('');
    setOutcome('schedule');

    if (outcome === 'schedule' && nextFollowUpPreview) {
      onSuccess(
        `Saved. Next call reminder: ${nextFollowUpPreview.toLocaleString('en-IN')}.`,
      );
    } else if (outcome === 'purchased') {
      onSuccess('Saved as Won / already purchased. No further call reminders.');
    } else {
      onSuccess('Saved as do-not-call / Lost. Follow-up reminders cleared.');
    }
  }

  return (
    <form className="crm-contact-log crm-contact-log-pro" onSubmit={onFormSubmit}>
      <p className="crm-contact-intro">
        After the call: write customer feedback, update Hot/Warm/Cold or budget if needed, then
        choose <strong>when to call next</strong> — or stop calling if they already bought.
      </p>
      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}

      <div className="crm-contact-section">
        <h3 className="crm-contact-section-title">
          <Phone size={16} aria-hidden />
          This contact
        </h3>
        <div className="crm-form-grid">
          <div className="crm-field">
            <label htmlFor="contact-type">Contact type</label>
            <select
              id="contact-type"
              value={contactType}
              onChange={(e) => setContactType(e.target.value as FollowUpType)}
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label htmlFor="contact-status">Pipeline status</label>
            <select
              id="contact-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as LeadStatus | '')}
              disabled={outcome !== 'schedule'}
            >
              <option value="">Keep current ({lead.status})</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {showAssign ? (
            <div className="crm-field span2">
              <label htmlFor="contact-owner">Lead owner</label>
              <select
                id="contact-owner"
                value={assignStaffId}
                onChange={(e) => setAssignStaffId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {staffOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="crm-field span2">
            <label htmlFor="client-response">Customer feedback / discussion *</label>
            <textarea
              id="client-response"
              required
              rows={3}
              placeholder="e.g. Call me after 2 days. Budget around ₹8L. Interested in Creta."
              value={clientResponse}
              onChange={(e) => setClientResponse(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="crm-contact-section">
        <h3 className="crm-contact-section-title">Update from this call</h3>
        <div className="crm-form-grid">
          <div className="crm-field">
            <label htmlFor="contact-priority">Priority (Hot / Warm / Cold)</label>
            <select
              id="contact-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as LeadPriority)}
            >
              {LEAD_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label htmlFor="contact-budget">Budget (₹)</label>
            <input
              id="contact-budget"
              inputMode="numeric"
              placeholder={lead.budget?.toString() ?? 'e.g. 825000'}
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
      </div>

      <div className="crm-contact-section">
        <h3 className="crm-contact-section-title">What next?</h3>
        <div className="crm-outcome-chips" role="radiogroup" aria-label="Call outcome">
          <button
            type="button"
            role="radio"
            aria-checked={outcome === 'schedule'}
            className={`crm-outcome-chip${outcome === 'schedule' ? ' is-active' : ''}`}
            onClick={() => setOutcome('schedule')}
          >
            <CalendarClock size={16} aria-hidden />
            Call again later
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={outcome === 'purchased'}
            className={`crm-outcome-chip${outcome === 'purchased' ? ' is-active' : ''}`}
            onClick={() => setOutcome('purchased')}
          >
            <CheckCircle2 size={16} aria-hidden />
            Already purchased
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={outcome === 'do_not_call'}
            className={`crm-outcome-chip${outcome === 'do_not_call' ? ' is-active' : ''}`}
            onClick={() => setOutcome('do_not_call')}
          >
            <Ban size={16} aria-hidden />
            Do not call again
          </button>
        </div>

        {outcome === 'schedule' ? (
          <div className="crm-next-follow-block">
            <p className="crm-next-follow-hint">
              Pick when you should call this customer again. That day it shows on your dashboard /
              follow-ups.
            </p>
            <div className="crm-day-presets">
              {DAY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`crm-day-preset${nextDays === p.value ? ' is-active' : ''}`}
                  onClick={() => setNextDays(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="crm-next-follow-row">
              {nextDays === 'custom' ? (
                <div className="crm-field">
                  <label htmlFor="next-date">Date</label>
                  <input
                    id="next-date"
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              ) : null}
              <div className="crm-field">
                <label htmlFor="next-time">Time</label>
                <input
                  id="next-time"
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                />
              </div>
              {nextFollowUpPreview ? (
                <p className="crm-next-preview">
                  Reminder:{' '}
                  <strong>{nextFollowUpPreview.toLocaleString('en-IN')}</strong>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {outcome === 'purchased' ? (
          <div className="crm-outcome-note crm-outcome-note-ok">
            Lead will be marked <strong>Won</strong>. Pending call reminders for this lead will be
            cleared.
          </div>
        ) : null}

        {outcome === 'do_not_call' ? (
          <div className="crm-outcome-note crm-outcome-note-warn">
            <div className="crm-field" style={{ marginBottom: '0.5rem' }}>
              <label htmlFor="lost-reason">Reason</label>
              <select
                id="lost-reason"
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value as LostReason)}
              >
                {LOST_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            Lead will be marked <strong>Lost</strong> and removed from call-reminder lists.
          </div>
        ) : null}
      </div>

      {openFollowUpId ? (
        <label className="crm-check-row">
          <input
            type="checkbox"
            checked={completeOpen}
            onChange={(e) => setCompleteOpen(e.target.checked)}
          />
          Mark the open scheduled follow-up as done with this note
        </label>
      ) : null}

      <button type="submit" className="crm-btn crm-btn-primary crm-contact-submit">
        Save contact &amp; outcome
      </button>
    </form>
  );
}
