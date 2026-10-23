import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import { Phone, MessageCircle } from 'lucide-react';

export function LeadDetailPage() {
  const { id } = useParams();
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

  const openFollowUp = followUps.find((f) => f.status === 'Scheduled');
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
              scheduleFollowUp({ ...input, status: 'Scheduled' });
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
            onSuccess={() => setMessage('Contact saved. Follow-up reminder updated.')}
          />
        </section>

        <section className="crm-panel">
          <h2 className="crm-panel-title">Customer summary</h2>
          <dl className="crm-dl">
            <dt>Mobile</dt>
            <dd>{lead.mobile}</dd>
            <dt>Source</dt>
            <dd>{lead.source}</dd>
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
            {vehicle ? (
              <>
                <dt>Linked stock</dt>
                <dd>
                  {vehicle.brand} {vehicle.model} · {formatINR(vehicle.sellingPrice)}
                </dd>
              </>
            ) : null}
          </dl>
        </section>
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

      <section className="crm-panel">
        <h2 className="crm-panel-title">Follow-up history</h2>
        {followUps.length === 0 ? (
          <p className="crm-empty">No follow-ups yet.</p>
        ) : (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Notes / outcome</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.id}>
                    <td>{new Date(f.scheduledAt).toLocaleString('en-IN')}</td>
                    <td>{f.type}</td>
                    <td>{f.status}</td>
                    <td>{f.outcome ?? f.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="crm-panel">
        <h2 className="crm-panel-title">Activity timeline</h2>
        <div className="crm-timeline">
          {activities.length === 0 ? (
            <p className="crm-empty">No activity recorded.</p>
          ) : (
            activities.map((a) => (
              <div key={a.id} className="crm-timeline-item">
                <strong>{a.title}</strong>
                {a.detail ? <div>{a.detail}</div> : null}
                <span>
                  {getUserById(a.actorId)?.name ?? 'System'} ·{' '}
                  {new Date(a.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
