import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { DashboardTodayQueue } from '../components/DashboardTodayQueue';
import { PipelineFunnel } from '../components/PipelineFunnel';
import { LeadSourceChart } from '../components/LeadSourceChart';
import { formatINR } from '../../utils/format';
import { getDueFollowUpsForLeads, isHotPriority, isToday } from '../utils/followUpDue';
import {
  getNeedsAttention,
  getPipelineCounts,
  getSourceBreakdown,
} from '../utils/leadInsights';
import { canManageUsers, roleLabel, shouldFilterDashboardToSelf } from '../utils/permissions';

export function DashboardPage() {
  const { visibleLeads, state, currentUser } = useCrm();
  const isAdmin = canManageUsers(currentUser);
  const userId = shouldFilterDashboardToSelf(currentUser) ? currentUser?.id : undefined;

  const dueItems = useMemo(
    () => getDueFollowUpsForLeads(state.followUps, visibleLeads, userId),
    [state.followUps, visibleLeads, userId],
  );

  const attention = useMemo(
    () => getNeedsAttention(visibleLeads, state.followUps),
    [visibleLeads, state.followUps],
  );

  const pipeline = useMemo(() => getPipelineCounts(visibleLeads), [visibleLeads]);
  const sources = useMemo(() => getSourceBreakdown(visibleLeads), [visibleLeads]);

  const kpis = useMemo(() => {
    const active = visibleLeads.filter(
      (l) => !['Converted / Sold', 'Lost'].includes(l.status),
    );
    const newToday = visibleLeads.filter((l) => isToday(l.createdAt));
    const hot = active.filter((l) => isHotPriority(l.priority));
    const converted = visibleLeads.filter((l) => l.status === 'Converted / Sold');
    const lost = visibleLeads.filter((l) => l.status === 'Lost');
    const closed = converted.length + lost.length;
    const conversion = closed === 0 ? 0 : Math.round((converted.length / closed) * 100);
    const overdueCount = dueItems.filter((d) => d.kind === 'overdue').length;
    const todayCount = dueItems.filter((d) => d.kind === 'today').length;
    const visitScheduled = active.filter((l) => l.status === 'Visit Scheduled').length;
    const negotiation = active.filter((l) => l.status === 'Negotiation').length;
    const stockAvail = state.vehicles.filter((v) => v.availability === 'Available').length;

    return [
      { label: 'Active pipeline', value: active.length, hint: 'Open opportunities' },
      { label: 'New today', value: newToday.length, hint: 'Fresh enquiries' },
      { label: 'Overdue tasks', value: overdueCount, hint: 'Needs action now', alert: overdueCount > 0 },
      { label: 'Due today', value: todayCount, hint: 'Follow-ups scheduled' },
      { label: 'Hot / high', value: hot.length, hint: 'Priority customers' },
      { label: 'Conversion', value: `${conversion}%`, hint: 'Sold vs lost (closed)' },
      { label: 'Visits / negotiation', value: `${visitScheduled} / ${negotiation}`, hint: 'Late funnel' },
      { label: 'Stock available', value: stockAvail, hint: 'Ready to sell' },
    ];
  }, [visibleLeads, dueItems, state.vehicles]);

  const greeting = currentUser?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="crm-dash">
      <header className="crm-dash-hero">
        <div>
          <p className="crm-dash-eyebrow">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <h1 className="crm-dash-greeting">Good day, {greeting}</h1>
          <p className="crm-dash-role">
            {roleLabel(currentUser!.role)} · Unity Auto Solution, Pune
          </p>
        </div>
        <div className="crm-actions">
          {currentUser?.role !== 'staff' ? (
            <Link to="/admin/leads/import" className="crm-btn crm-btn-secondary">
              Import CSV
            </Link>
          ) : null}
          <Link to="/admin/leads/new" className="crm-btn crm-btn-primary">
            + New lead
          </Link>
        </div>
      </header>

      <div className="crm-dash-kpis">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`crm-dash-kpi${k.alert ? ' crm-dash-kpi-alert' : ''}`}
          >
            <span className="crm-dash-kpi-label">{k.label}</span>
            <span className="crm-dash-kpi-value">{k.value}</span>
            <span className="crm-dash-kpi-hint">{k.hint}</span>
          </div>
        ))}
      </div>

      <div className="crm-dash-main-grid">
        <DashboardTodayQueue
          attention={attention}
          dueToday={dueItems.filter((d) => d.kind === 'today')}
          overdue={dueItems.filter((d) => d.kind === 'overdue')}
        />

        <aside className="crm-dash-side">
          <section className="crm-panel">
            <h2 className="crm-panel-title">Pipeline</h2>
            <PipelineFunnel counts={pipeline} total={visibleLeads.length} />
          </section>
          <section className="crm-panel">
            <h2 className="crm-panel-title">Lead sources</h2>
            <LeadSourceChart data={sources} />
          </section>
          <section className="crm-panel">
            <h2 className="crm-panel-title">Stock</h2>
            <p className="crm-dash-stock-line">
              {state.vehicles.filter((v) => v.availability === 'Available').length} available · avg{' '}
              {formatINR(
                Math.round(
                  state.vehicles.reduce((s, v) => s + v.sellingPrice, 0) /
                    Math.max(state.vehicles.length, 1),
                ),
              )}
            </p>
            <Link to="/admin/vehicles" className="crm-link">
              Manage stock →
            </Link>
          </section>
        </aside>
      </div>

      {isAdmin ? (
        <section className="crm-panel">
          <h2 className="crm-panel-title">Team snapshot</h2>
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Assigned</th>
                  <th>Overdue F/U</th>
                  <th>Converted</th>
                </tr>
              </thead>
              <tbody>
                {state.users
                  .filter((u) => u.status === 'active' && u.role !== 'admin')
                  .map((u) => {
                    const assigned = state.leads.filter((l) => l.assignedStaffId === u.id);
                    const converted = assigned.filter((l) => l.status === 'Converted / Sold');
                    const overdue = state.followUps.filter(
                      (f) =>
                        f.assignedStaffId === u.id &&
                        f.status === 'Scheduled' &&
                        new Date(f.scheduledAt).getTime() < Date.now(),
                    ).length;
                    return (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{roleLabel(u.role)}</td>
                        <td>{assigned.length}</td>
                        <td>{overdue}</td>
                        <td>{converted.length}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
