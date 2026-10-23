import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { getDueFollowUpsForLeads, isOverdue, isToday } from '../utils/followUpDue';
import { shouldFilterDashboardToSelf } from '../utils/permissions';

export function FollowUpsPage() {
  const { visibleLeads, state, currentUser } = useCrm();

  const userId = shouldFilterDashboardToSelf(currentUser) ? currentUser?.id : undefined;

  const scheduled = useMemo(
    () =>
      state.followUps
        .filter((f) => f.status === 'Scheduled')
        .filter((f) => visibleLeads.some((l) => l.id === f.leadId))
        .filter((f) => !userId || f.assignedStaffId === userId)
        .map((f) => ({
          f,
          lead: visibleLeads.find((l) => l.id === f.leadId)!,
        }))
        .filter((x) => x.lead)
        .sort(
          (a, b) =>
            new Date(a.f.scheduledAt).getTime() - new Date(b.f.scheduledAt).getTime(),
        ),
    [state.followUps, visibleLeads, userId],
  );

  const dueItems = useMemo(
    () => getDueFollowUpsForLeads(state.followUps, visibleLeads, userId),
    [state.followUps, visibleLeads, userId],
  );

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Follow-ups</h1>
          <p className="crm-page-sub">
            Scheduled calls, visits, and WhatsApp — your daily work list
          </p>
        </div>
      </header>

      <div className="crm-grid-cards">
        <div className="crm-stat-card crm-stat-card-alert">
          <div className="crm-stat-label">Overdue</div>
          <div className="crm-stat-value">{dueItems.filter((d) => d.kind === 'overdue').length}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Due today</div>
          <div className="crm-stat-value">{dueItems.filter((d) => d.kind === 'today').length}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Upcoming</div>
          <div className="crm-stat-value">{dueItems.filter((d) => d.kind === 'upcoming').length}</div>
        </div>
      </div>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {scheduled.map(({ f, lead }) => {
              const overdue = isOverdue(f.scheduledAt);
              const today = isToday(f.scheduledAt);
              return (
                <tr key={f.id} className={overdue ? 'crm-row-hot' : undefined}>
                  <td>
                    {new Date(f.scheduledAt).toLocaleString('en-IN')}
                    {overdue ? (
                      <span className="crm-dash-reason crm-dash-reason-danger"> Overdue</span>
                    ) : today ? (
                      <span className="crm-dash-reason crm-dash-reason-warning"> Today</span>
                    ) : null}
                  </td>
                  <td>
                    <Link to={`/admin/leads/${lead.id}`} className="crm-link">
                      {lead.customerName}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--crm-muted)' }}>{lead.mobile}</div>
                  </td>
                  <td>{f.type}</td>
                  <td>{f.status}</td>
                  <td>{f.notes ?? '—'}</td>
                  <td>
                    <div className="crm-dash-queue-actions">
                      <a href={`tel:${lead.mobile}`} className="crm-dash-action-btn">
                        <Phone size={14} aria-hidden />
                      </a>
                      <a
                        href={`https://wa.me/91${lead.mobile.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="crm-dash-action-btn crm-dash-action-wa"
                      >
                        <MessageCircle size={14} aria-hidden />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {scheduled.length === 0 ? (
          <p className="crm-empty">No scheduled follow-ups.</p>
        ) : null}
      </div>
    </>
  );
}
