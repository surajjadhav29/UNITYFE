import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import { LeadStatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { LeadContactLog } from '../components/LeadContactLog';
import { LeadStockShare } from '../components/LeadStockShare';
import {
  canEditLead,
  canManageUsers,
  filterAssignableStaff,
} from '../utils/permissions';
import { formatINR } from '../../utils/format';
import { isOverdue, isToday } from '../utils/followUpDue';
import { VehicleMatchSuggestions } from '../components/VehicleMatchSuggestions';
import { QuickScheduleFollowUp } from '../components/QuickScheduleFollowUp';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state,
    currentUser,
    getUserById,
    updateLead,
    logContact,
    addActivity,
    scheduleFollowUp,
  } = useCrm();

  const [message, setMessage] = useState('');

  const lead = state.leads.find((l) => l.id === id);

  const stockOptions = useMemo(() => {
    const mappedId = lead?.interestedVehicleId;
    const list = state.vehicles.filter(
      (v) =>
        v.availability === 'Available' ||
        v.availability === 'Reserved' ||
        v.id === mappedId,
    );
    return [...list].sort((a, b) =>
      `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`),
    );
  }, [state.vehicles, lead?.interestedVehicleId]);

  if (!lead || !currentUser) return null;
  if (!canEditLead(currentUser, lead)) {
    return <Navigate to="/admin/leads" replace />;
  }

  const activities = state.activities
    .filter((a) => a.leadId === lead.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const followUps = state.followUps
    .filter((f) => f.leadId === lead.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const openFollowUp = followUps.find((f) => f.status === 'Pending');
  const dueAlert = openFollowUp
    ? isOverdue(openFollowUp.scheduledAt)
      ? 'overdue'
      : isToday(openFollowUp.scheduledAt)
        ? 'today'
        : null
    : null;

  const staffOptions = filterAssignableStaff(state.users).map((u) => ({
    id: u.id,
    name: u.name,
  }));

  const vehicle = lead.interestedVehicleId
    ? state.vehicles.find((v) => v.id === lead.interestedVehicleId)
    : undefined;

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/admin/leads');
  }

  function mapStockVehicle(vehicleId: string) {
    const nextId = vehicleId || undefined;
    const prev = lead!.interestedVehicleId;
    if (nextId === prev) return;
    updateLead(lead!.id, { interestedVehicleId: nextId });
    const v = nextId ? state.vehicles.find((x) => x.id === nextId) : undefined;
    addActivity(lead!.id, {
      type: 'note',
      title: nextId ? 'Stock mapped to lead' : 'Stock mapping cleared',
      detail: v
        ? `Mapped to ${v.brand} ${v.model} (${formatINR(v.sellingPrice)})`
        : 'No stock vehicle linked.',
    });
    setMessage(
      v
        ? `Lead mapped to ${v.brand} ${v.model}. Push this car to the customer.`
        : 'Stock mapping cleared.',
    );
  }

  function linkVehicle(vehicleId: string) {
    updateLead(lead!.id, { interestedVehicleId: vehicleId });
    addActivity(lead!.id, {
      type: 'note',
      title: 'Stock shared on WhatsApp',
      detail: `Vehicle ${vehicleId} details sent to customer.`,
    });
    setMessage('Vehicle linked and WhatsApp opened.');
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">
            {lead.customerName}{' '}
            <PriorityBadge priority={lead.priority} />
          </h1>
          <p className="crm-page-sub">
            {lead.id} · <LeadStatusBadge status={lead.status} /> · Owner:{' '}
            {getUserById(lead.assignedStaffId)?.name ?? 'Unassigned'} ·{' '}
            <Link to="/admin/leads" className="crm-link">
              All leads
            </Link>
          </p>
        </div>
        <div className="crm-actions">
          <button
            type="button"
            className="crm-btn crm-btn-secondary"
            onClick={goBack}
            aria-label="Back to previous page"
          >
            <ArrowLeft size={16} aria-hidden />
            Back
          </button>
          <a href={`tel:${lead.mobile}`} className="crm-btn crm-btn-secondary">
            <Phone size={16} aria-hidden />
            Call
          </a>
          <a
            href={`https://wa.me/91${lead.mobile.replace(/\D/g, '').slice(-10)}`}
            target="_blank"
            rel="noreferrer"
            className="crm-btn crm-btn-secondary"
          >
            <MessageCircle size={16} aria-hidden />
            WhatsApp
          </a>
          <QuickScheduleFollowUp
            leadId={lead.id}
            staffId={lead.assignedStaffId ?? currentUser.id}
            onSchedule={(input) => {
              scheduleFollowUp({ ...input, status: 'Pending' });
              setMessage('Follow-up scheduled.');
            }}
          />
          <Link to={`/admin/leads/${lead.id}/edit`} className="crm-btn crm-btn-secondary">
            Edit lead
          </Link>
        </div>
      </header>

      {dueAlert === 'today' ? (
        <div className="crm-alert crm-alert-warning">
          <strong>Call today:</strong> You scheduled a {openFollowUp?.type} for this customer.
          Log the contact below when done.
        </div>
      ) : null}
      {dueAlert === 'overdue' ? (
        <div className="crm-alert crm-alert-error">
          <strong>Overdue:</strong> Follow-up was due{' '}
          {openFollowUp ? new Date(openFollowUp.scheduledAt).toLocaleString('en-IN') : ''}.
        </div>
      ) : null}

      {message ? <div className="crm-alert crm-alert-success">{message}</div> : null}

      <div className="crm-detail-grid">
        <section className="crm-panel">
          <h2 className="crm-panel-title">Record contact</h2>
          <LeadContactLog
            lead={lead}
            staffOptions={staffOptions}
            showAssign={canManageUsers(currentUser)}
            openFollowUpId={openFollowUp?.id}
            onSubmit={logContact}
            onSuccess={(summary) => setMessage(summary)}
          />
        </section>

        <aside className="crm-panel crm-summary-panel">
          <h2 className="crm-panel-title">Customer summary</h2>
          <dl className="crm-dl">
            <dt>Mobile</dt>
            <dd>{lead.mobile}</dd>
            <dt>Source</dt>
            <dd>{lead.source}</dd>
            <dt>Priority</dt>
            <dd>
              <PriorityBadge priority={lead.priority} />
            </dd>
            <dt>Status</dt>
            <dd>
              <LeadStatusBadge status={lead.status} />
            </dd>
            <dt>Budget</dt>
            <dd>{lead.budget ? formatINR(lead.budget) : '—'}</dd>
            <dt>Preferred car</dt>
            <dd>{lead.preferredCar ?? '—'}</dd>
            <dt>Last contact</dt>
            <dd>
              {lead.lastContactAt
                ? new Date(lead.lastContactAt).toLocaleString('en-IN')
                : '—'}
            </dd>
            <dt>Next follow-up</dt>
            <dd>
              {lead.nextFollowUpAt
                ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN')
                : '—'}
            </dd>
            <dt>Remarks</dt>
            <dd>{lead.remarks ?? '—'}</dd>
          </dl>

          <div className="crm-summary-stock">
            <label className="crm-summary-stock-label" htmlFor="lead-map-stock">
              Map stock
            </label>
            <select
              id="lead-map-stock"
              className="crm-summary-stock-select"
              aria-label="Map stock vehicle to this lead"
              value={lead.interestedVehicleId ?? ''}
              onChange={(e) => mapStockVehicle(e.target.value)}
            >
              <option value="">Select car from stock…</option>
              {stockOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} · {v.year} · {formatINR(v.sellingPrice)} ·{' '}
                  {v.availability}
                </option>
              ))}
            </select>
            {vehicle ? (
              <p className="crm-summary-stock-hint">
                Push this unit: {vehicle.brand} {vehicle.model} ·{' '}
                {formatINR(vehicle.sellingPrice)}
              </p>
            ) : (
              <p className="crm-summary-stock-hint">
                Choose which stock car this lead is for — then sell that car.
              </p>
            )}
          </div>

          <div className="crm-summary-stack">
            <div className="crm-summary-fu">
              <h3 className="crm-summary-fu-title">Follow-up history</h3>
              {followUps.length === 0 ? (
                <p className="crm-summary-fu-empty">No follow-ups yet.</p>
              ) : (
                <div className="crm-summary-fu-scroll" tabIndex={0}>
                  <ul className="crm-summary-fu-list">
                    {followUps.map((f) => (
                      <li key={f.id} className="crm-summary-fu-item">
                        <div className="crm-summary-fu-when">
                          {new Date(f.scheduledAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </div>
                        <div className="crm-summary-fu-meta">
                          <span className="crm-summary-fu-type">{f.type}</span>
                          <span
                            className={`crm-summary-fu-status crm-summary-fu-status-${f.status.toLowerCase()}`}
                          >
                            {f.status}
                          </span>
                        </div>
                        <p className="crm-summary-fu-note">
                          {f.outcome ?? f.notes ?? '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="crm-summary-fu crm-summary-activity">
              <h3 className="crm-summary-fu-title">Activity timeline</h3>
              {activities.length === 0 ? (
                <p className="crm-summary-fu-empty">No activity recorded.</p>
              ) : (
                <div className="crm-summary-fu-scroll" tabIndex={0}>
                  <ul className="crm-summary-fu-list">
                    {activities.map((a) => (
                      <li key={a.id} className="crm-summary-fu-item">
                        <div className="crm-summary-fu-when">{a.title}</div>
                        {a.detail ? (
                          <p className="crm-summary-fu-note">{a.detail}</p>
                        ) : null}
                        <div className="crm-summary-fu-meta">
                          <span className="crm-summary-fu-type">
                            {getUserById(a.actorId)?.name ?? 'System'} ·{' '}
                            {new Date(a.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <section className="crm-panel">
        <h2 className="crm-panel-title">Suggested stock match</h2>
        <p className="crm-contact-intro">
          Inventory matched to budget and preferences (like dealer CRM stock linking).
        </p>
        <VehicleMatchSuggestions
          lead={lead}
          vehicles={state.vehicles}
          onSelect={(vehicleId) => {
            updateLead(lead.id, { interestedVehicleId: vehicleId });
            setMessage('Vehicle linked to this lead.');
          }}
        />
      </section>

      <section className="crm-panel">
        <h2 className="crm-panel-title">Share stock on WhatsApp</h2>
        <LeadStockShare
          lead={lead}
          vehicles={state.vehicles}
          onLinkVehicle={linkVehicle}
        />
      </section>

    </>
  );
}
