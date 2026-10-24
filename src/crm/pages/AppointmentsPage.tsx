import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Plus, XCircle } from 'lucide-react';
import {
  CrmTable,
  crmTableActionsClass,
  crmTableLinkClass,
} from '../common/components/CrmTable';
import { StatusBadge } from '../components/StatusBadge';
import { useCrm } from '../context/CrmContext';
import { isToday, isOverdue } from '../utils/followUpDue';
import type { Appointment, AppointmentType } from '../types/crm.types';
import { filterAssignableStaff } from '../utils/permissions';
import '../styles/crm-leads.css';

const TYPES: AppointmentType[] = ['Showroom Visit', 'Test Drive', 'Delivery', 'Other'];

type ApptTab = 'all' | 'today' | 'upcoming' | 'past';

function isPastAppt(a: Appointment, now = new Date()): boolean {
  if (a.status === 'Completed' || a.status === 'Cancelled' || a.status === 'No-show') {
    return true;
  }
  return new Date(a.scheduledAt) < now && !isToday(a.scheduledAt, now);
}

export function AppointmentsPage() {
  const {
    visibleAppointments,
    visibleLeads,
    state,
    getUserById,
    createAppointment,
    updateAppointment,
    currentUser,
  } = useCrm();

  const [tab, setTab] = useState<ApptTab>('today');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackFor, setFeedbackFor] = useState<Appointment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [form, setForm] = useState({
    leadId: '',
    vehicleId: '',
    type: 'Test Drive' as AppointmentType,
    scheduledAt: '',
    assignedStaffId: currentUser?.id ?? '',
    location: 'DriveNext showroom, Kondhwa',
    notes: '',
  });

  const staffOptions = filterAssignableStaff(state.users);

  const classified = useMemo(() => {
    const now = new Date();
    return [...visibleAppointments].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    ).map((a) => {
      const overdue =
        a.status !== 'Completed' &&
        a.status !== 'Cancelled' &&
        a.status !== 'No-show' &&
        isOverdue(a.scheduledAt, now);
      const today = isToday(a.scheduledAt, now);
      const past = isPastAppt(a, now);
      const upcoming =
        !past && !today && new Date(a.scheduledAt) > now;
      return { a, overdue, today, past, upcoming };
    });
  }, [visibleAppointments]);

  const counts = useMemo(
    () => ({
      all: classified.length,
      today: classified.filter((x) => x.today && !x.past).length,
      upcoming: classified.filter((x) => x.upcoming).length,
      past: classified.filter((x) => x.past || x.overdue).length,
    }),
    [classified],
  );

  const rows = useMemo(() => {
    if (tab === 'today') return classified.filter((x) => x.today && !x.past);
    if (tab === 'upcoming') return classified.filter((x) => x.upcoming);
    if (tab === 'past') return classified.filter((x) => x.past || x.overdue);
    return classified;
  }, [classified, tab]);

  const tabs: { key: ApptTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'today', label: 'Today', count: counts.today },
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { key: 'past', label: 'Past', count: counts.past },
  ];

  function onCreate(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!form.leadId || !form.scheduledAt) {
      setMessage('Select a lead and date/time.');
      return;
    }
    const result = createAppointment({
      leadId: form.leadId,
      vehicleId: form.vehicleId || undefined,
      type: form.type,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      assignedStaffId: form.assignedStaffId || currentUser!.id,
      location: form.location,
      notes: form.notes,
      status: 'Scheduled',
    });
    if ('error' in result) {
      setMessage(result.error);
      return;
    }
    setShowForm(false);
    setMessage('Appointment scheduled.');
  }

  function openFeedback(a: Appointment) {
    setFeedbackFor(a);
    setFeedbackText(a.feedback ?? a.outcome ?? '');
  }

  function saveFeedback(event: FormEvent) {
    event.preventDefault();
    if (!feedbackFor) return;
    const text = feedbackText.trim();
    if (!text) {
      setMessage('Write visit / test-drive feedback.');
      return;
    }
    updateAppointment(feedbackFor.id, {
      status: 'Completed',
      outcome: text,
      feedback: text,
    });
    setFeedbackFor(null);
    setFeedbackText('');
    setMessage('Feedback saved. Appointment marked completed.');
  }

  function cancelAppt(a: Appointment, name: string) {
    if (!window.confirm(`Cancel appointment for ${name}?`)) return;
    updateAppointment(a.id, { status: 'Cancelled', outcome: 'Cancelled' });
    setMessage(`Cancelled: ${name}`);
  }

  return (
    <div className="fu-page">
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Appointments & test drives</h1>
          <p className="crm-page-sub">
            Schedule visits and test drives, then log customer feedback after they come.
          </p>
        </div>
        <button
          type="button"
          className="crm-btn crm-btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={16} aria-hidden />
          Schedule
        </button>
      </header>

      {message ? <div className="crm-alert crm-alert-success">{message}</div> : null}

      <div className="ld-tabs" role="tablist" aria-label="Appointment filters">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`ld-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label} <span className="ld-tab-count">{count}</span>
          </button>
        ))}
      </div>

      {showForm ? (
        <form className="crm-panel crm-form-grid" onSubmit={onCreate}>
          <h2 className="crm-panel-title">New appointment</h2>
          <label className="crm-field">
            Lead
            <select
              required
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
            >
              <option value="">Select lead</option>
              {visibleLeads
                .filter((l) => l.status !== 'Won' && l.status !== 'Lost')
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.customerName} ({l.id})
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            Vehicle (optional)
            <select
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
            >
              <option value="">—</option>
              {state.vehicles
                .filter((v) => v.availability === 'Available' || v.availability === 'Reserved')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.year})
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            Type
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as AppointmentType }))
              }
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field">
            Date & time
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
          </label>
          <label className="crm-field">
            Assigned to
            <select
              value={form.assignedStaffId}
              onChange={(e) => setForm((f) => ({ ...f, assignedStaffId: e.target.value }))}
            >
              {staffOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field crm-span-2">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </label>
          <label className="crm-field crm-span-2">
            Notes
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>
          <div className="crm-form-actions crm-span-2">
            <button
              type="button"
              className="crm-btn crm-btn-ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              Save appointment
            </button>
          </div>
        </form>
      ) : null}

      {feedbackFor ? (
        <form className="crm-panel crm-form-grid" onSubmit={saveFeedback}>
          <h2 className="crm-panel-title">Visit / test-drive feedback</h2>
          <p className="crm-contact-intro crm-span-2">
            Customer came for this appointment. Write what they said — liked the car, price
            concern, will decide later, etc.
          </p>
          <label className="crm-field crm-span-2">
            Feedback *
            <textarea
              rows={4}
              required
              placeholder="e.g. Liked City VX, asked for exchange value, will confirm tomorrow."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </label>
          <div className="crm-form-actions crm-span-2">
            <button
              type="button"
              className="crm-btn crm-btn-ghost"
              onClick={() => {
                setFeedbackFor(null);
                setFeedbackText('');
              }}
            >
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              Save feedback &amp; complete
            </button>
          </div>
        </form>
      ) : null}

      <CrmTable stickyHeader>
        <CrmTable.Head>
          <tr>
            <CrmTable.HeadCell>When</CrmTable.HeadCell>
            <CrmTable.HeadCell>Customer</CrmTable.HeadCell>
            <CrmTable.HeadCell>Type</CrmTable.HeadCell>
            <CrmTable.HeadCell>Vehicle</CrmTable.HeadCell>
            <CrmTable.HeadCell>Owner</CrmTable.HeadCell>
            <CrmTable.HeadCell>Status</CrmTable.HeadCell>
            <CrmTable.HeadCell>Feedback</CrmTable.HeadCell>
            <CrmTable.HeadCell className={crmTableActionsClass}>Actions</CrmTable.HeadCell>
          </tr>
        </CrmTable.Head>
        <CrmTable.Body>
          {rows.length === 0 ? (
            <CrmTable.EmptyRow colSpan={8}>No appointments for this view.</CrmTable.EmptyRow>
          ) : (
            rows.map(({ a, overdue, today }) => {
              const lead = state.leads.find((l) => l.id === a.leadId);
              const vehicle = a.vehicleId
                ? state.vehicles.find((v) => v.id === a.vehicleId)
                : undefined;
              const open =
                a.status !== 'Completed' &&
                a.status !== 'Cancelled' &&
                a.status !== 'No-show';
              const feedback = a.feedback ?? a.outcome ?? '—';
              return (
                <CrmTable.Row key={a.id} alert={overdue}>
                  <CrmTable.Cell>
                    <div className="fu-when">
                      {new Date(a.scheduledAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                    {overdue ? (
                      <span className="fu-badge fu-badge-danger">Overdue</span>
                    ) : today && open ? (
                      <span className="fu-badge fu-badge-warn">Today</span>
                    ) : null}
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    {lead ? (
                      <Link to={`/admin/leads/${lead.id}`} className={crmTableLinkClass}>
                        {lead.customerName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </CrmTable.Cell>
                  <CrmTable.Cell>{a.type}</CrmTable.Cell>
                  <CrmTable.Cell>
                    {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    {getUserById(a.assignedStaffId)?.name ?? '—'}
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    <StatusBadge
                      label={a.status}
                      tone={
                        a.status === 'Completed'
                          ? 'ok'
                          : overdue
                            ? 'warn'
                            : a.status === 'Cancelled' || a.status === 'No-show'
                              ? 'danger'
                              : 'neutral'
                      }
                    />
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    <span className="fu-note" title={feedback}>
                      {feedback}
                    </span>
                  </CrmTable.Cell>
                  <CrmTable.Cell className={crmTableActionsClass}>
                    <div className="crm-table-icon-actions">
                      {lead ? (
                        <Link
                          to={`/admin/leads/${lead.id}`}
                          className="crm-table-icon-btn"
                          title="Open lead"
                        >
                          <ExternalLink size={17} strokeWidth={1.6} aria-hidden />
                        </Link>
                      ) : null}
                      {open ? (
                        <>
                          <button
                            type="button"
                            className="crm-table-icon-btn"
                            title="Add visit feedback"
                            aria-label="Add feedback"
                            onClick={() => openFeedback(a)}
                          >
                            <CheckCircle2 size={17} strokeWidth={1.6} aria-hidden />
                          </button>
                          <button
                            type="button"
                            className="crm-table-icon-btn crm-table-icon-btn--danger"
                            title="Cancel"
                            aria-label="Cancel appointment"
                            onClick={() =>
                              cancelAppt(a, lead?.customerName ?? a.id)
                            }
                          >
                            <XCircle size={17} strokeWidth={1.6} aria-hidden />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </CrmTable.Cell>
                </CrmTable.Row>
              );
            })
          )}
        </CrmTable.Body>
      </CrmTable>
    </div>
  );
}
