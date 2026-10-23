import { useMemo, useState, type FormEvent } from 'react';
import { LEAD_STATUSES } from '../constants';
import type { FollowUpType, Lead, LeadStatus } from '../types/crm.types';
import type { LogContactInput } from '../context/CrmContext';
import { addDaysFromNow } from '../utils/followUpDue';

const CONTACT_TYPES: FollowUpType[] = ['Call', 'WhatsApp', 'Visit', 'Email', 'Other'];

interface LeadContactLogProps {
  lead: Lead;
  staffOptions: { id: string; name: string }[];
  showAssign: boolean;
  openFollowUpId?: string;
  onSubmit: (input: LogContactInput) => { ok: true } | { ok: false; error: string };
  onSuccess: () => void;
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
  const [newStatus, setNewStatus] = useState<LeadStatus | ''>('');
  const [assignStaffId, setAssignStaffId] = useState(lead.assignedStaffId ?? '');
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextDays, setNextDays] = useState('2');
  const [nextTime, setNextTime] = useState('10:00');
  const [completeOpen, setCompleteOpen] = useState(Boolean(openFollowUpId));
  const [error, setError] = useState('');

  const nextFollowUpPreview = useMemo(() => {
    if (!scheduleNext) return null;
    const d = new Date(addDaysFromNow(Number(nextDays) || 0));
    const [h, m] = nextTime.split(':').map(Number);
    d.setHours(h || 10, m || 0, 0, 0);
    return d;
  }, [scheduleNext, nextDays, nextTime]);

  function onFormSubmit(event: FormEvent) {
    event.preventDefault();
    let nextFollowUpAt: string | undefined;
    if (scheduleNext && nextFollowUpPreview) {
      nextFollowUpAt = nextFollowUpPreview.toISOString();
    }

    const result = onSubmit({
      leadId: lead.id,
      contactType,
      clientResponse,
      newStatus: newStatus || undefined,
      assignStaffId: showAssign ? assignStaffId || null : undefined,
      nextFollowUpAt,
      nextFollowUpType: contactType,
      completeScheduledFollowUpId:
        completeOpen && openFollowUpId ? openFollowUpId : undefined,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setClientResponse('');
    setNewStatus('');
    onSuccess();
  }

  return (
    <form className="crm-contact-log" onSubmit={onFormSubmit}>
      <p className="crm-contact-intro">
        Log the call or visit, what the customer said, and when you will follow up next. On that
        day it will appear under <strong>Today&apos;s follow-ups</strong> for the assigned staff.
      </p>
      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}

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
          <label htmlFor="contact-status">Update status (optional)</label>
          <select
            id="contact-status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as LeadStatus | '')}
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
          <label htmlFor="client-response">Customer response / discussion *</label>
          <textarea
            id="client-response"
            required
            placeholder="e.g. Wants to see Creta on Saturday. Asked for best price."
            value={clientResponse}
            onChange={(e) => setClientResponse(e.target.value)}
          />
        </div>
      </div>

      {openFollowUpId ? (
        <label className="crm-check-row">
          <input
            type="checkbox"
            checked={completeOpen}
            onChange={(e) => setCompleteOpen(e.target.checked)}
          />
          Mark today&apos;s scheduled follow-up as done with this note
        </label>
      ) : null}

      <div className="crm-next-follow-block">
        <label className="crm-check-row">
          <input
            type="checkbox"
            checked={scheduleNext}
            onChange={(e) => setScheduleNext(e.target.checked)}
          />
          Schedule next follow-up (self reminder)
        </label>
        {scheduleNext ? (
          <div className="crm-next-follow-row">
            <div className="crm-field">
              <label htmlFor="next-days">After</label>
              <select
                id="next-days"
                value={nextDays}
                onChange={(e) => setNextDays(e.target.value)}
              >
                <option value="0">Today</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            </div>
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
        ) : null}
      </div>

      <button type="submit" className="crm-btn crm-btn-primary">
        Save contact &amp; follow-up
      </button>
    </form>
  );
}
