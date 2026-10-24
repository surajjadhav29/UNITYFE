import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import {
  CrmTable,
  crmTableActionsClass,
  crmTableLinkClass,
} from '../common/components/CrmTable';
import { PriorityBadge } from '../components/PriorityBadge';
import { LeadStatusBadge } from '../components/StatusBadge';
import { useCrm } from '../context/CrmContext';
import { getDueFollowUpsForLeads, isOverdue, isToday } from '../utils/followUpDue';
import {
  isTeamLead,
  shouldFilterDashboardToSelf,
} from '../utils/permissions';
import '../styles/crm-leads.css';

type FuTab = 'all' | 'overdue' | 'today' | 'upcoming';
type Scope = 'mine' | 'team';

export function FollowUpsPage() {
  const {
    visibleLeads,
    state,
    currentUser,
    getUserById,
    completeFollowUp,
  } = useCrm();

  const teamView = isTeamLead(currentUser);
  const [scope, setScope] = useState<Scope>(
    shouldFilterDashboardToSelf(currentUser) ? 'mine' : 'mine',
  );
  const [tab, setTab] = useState<FuTab>('today');

  const userId =
    !teamView || scope === 'mine' ? currentUser?.id : undefined;

  const dueItems = useMemo(
    () => getDueFollowUpsForLeads(state.followUps, visibleLeads, userId),
    [state.followUps, visibleLeads, userId],
  );

  const counts = useMemo(
    () => ({
      all: dueItems.length,
      overdue: dueItems.filter((d) => d.kind === 'overdue').length,
      today: dueItems.filter((d) => d.kind === 'today').length,
      upcoming: dueItems.filter((d) => d.kind === 'upcoming').length,
    }),
    [dueItems],
  );

  const rows = useMemo(() => {
    const list =
      tab === 'all' ? dueItems : dueItems.filter((d) => d.kind === tab);
    return list;
  }, [dueItems, tab]);

  const lastContactNote = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of state.activities) {
      if (a.type !== 'contact' && a.type !== 'note') continue;
      if (!a.detail || map.has(a.leadId)) continue;
      map.set(a.leadId, a.detail);
    }
    return map;
  }, [state.activities]);

  function markDone(followUpId: string, leadName: string) {
    const outcome =
      window.prompt(
        `Outcome for ${leadName}? (e.g. Called — will decide tomorrow)`,
        'Contacted — follow-up done',
      ) ?? '';
    if (!outcome.trim()) return;
    completeFollowUp(followUpId, outcome.trim());
  }

  const tabs: { key: FuTab; label: string; count: number }[] = [
    { key: 'today', label: 'Due today', count: counts.today },
    { key: 'overdue', label: 'Overdue', count: counts.overdue },
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { key: 'all', label: 'All pending', count: counts.all },
  ];

  return (
    <div className="fu-page">
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Follow-ups</h1>
          <p className="crm-page-sub">
            Your call / visit queue for today — same work list linked from Leads “next call”
            reminders.
          </p>
        </div>
        {teamView ? (
          <div className="ld-view-toggle" role="group" aria-label="Follow-up scope">
            <button
              type="button"
              className={scope === 'mine' ? 'active' : undefined}
              onClick={() => setScope('mine')}
            >
              My queue
            </button>
            <button
              type="button"
              className={scope === 'team' ? 'active' : undefined}
              onClick={() => setScope('team')}
            >
              Team
            </button>
          </div>
        ) : null}
      </header>

      <div className="crm-grid-cards fu-kpi">
        <div className="crm-stat-card crm-stat-card-alert">
          <div className="crm-stat-label">Overdue</div>
          <div className="crm-stat-value">{counts.overdue}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Due today</div>
          <div className="crm-stat-value">{counts.today}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Upcoming</div>
          <div className="crm-stat-value">{counts.upcoming}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">All pending</div>
          <div className="crm-stat-value">{counts.all}</div>
        </div>
      </div>

      <div className="ld-tabs" role="tablist" aria-label="Follow-up filters">
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

      <CrmTable stickyHeader>
        <CrmTable.Head>
          <tr>
            <CrmTable.HeadCell>When</CrmTable.HeadCell>
            <CrmTable.HeadCell>Lead</CrmTable.HeadCell>
            <CrmTable.HeadCell>Priority</CrmTable.HeadCell>
            <CrmTable.HeadCell>Lead status</CrmTable.HeadCell>
            <CrmTable.HeadCell>Type</CrmTable.HeadCell>
            <CrmTable.HeadCell>Reminder / note</CrmTable.HeadCell>
            <CrmTable.HeadCell>Last contact</CrmTable.HeadCell>
            {teamView && scope === 'team' ? (
              <CrmTable.HeadCell>Assigned to</CrmTable.HeadCell>
            ) : null}
            <CrmTable.HeadCell className={crmTableActionsClass}>Actions</CrmTable.HeadCell>
          </tr>
        </CrmTable.Head>
        <CrmTable.Body>
          {rows.length === 0 ? (
            <CrmTable.EmptyRow colSpan={teamView && scope === 'team' ? 9 : 8}>
              {tab === 'today'
                ? 'Nothing due today. You’re clear.'
                : tab === 'overdue'
                  ? 'No overdue follow-ups.'
                  : 'No pending follow-ups in this view.'}
            </CrmTable.EmptyRow>
          ) : (
            rows.map(({ followUp: f, lead, kind }) => {
              const overdue = kind === 'overdue' || isOverdue(f.scheduledAt);
              const today = kind === 'today' || isToday(f.scheduledAt);
              const note =
                f.notes ||
                lastContactNote.get(lead.id) ||
                lead.remarks?.split('\n—\n').pop() ||
                '—';
              return (
                <CrmTable.Row key={f.id} alert={overdue}>
                  <CrmTable.Cell>
                    <div className="fu-when">
                      {new Date(f.scheduledAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                    {overdue ? (
                      <span className="fu-badge fu-badge-danger">Overdue</span>
                    ) : today ? (
                      <span className="fu-badge fu-badge-warn">Today</span>
                    ) : (
                      <span className="fu-badge">Upcoming</span>
                    )}
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    <Link
                      to={`/admin/leads/${lead.id}`}
                      className={crmTableLinkClass}
                    >
                      {lead.customerName}
                    </Link>
                    <div className="fu-sub">{lead.mobile}</div>
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    <PriorityBadge priority={lead.priority} />
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    <LeadStatusBadge status={lead.status} />
                  </CrmTable.Cell>
                  <CrmTable.Cell>{f.type}</CrmTable.Cell>
                  <CrmTable.Cell>
                    <span className="fu-note" title={note}>
                      {note}
                    </span>
                  </CrmTable.Cell>
                  <CrmTable.Cell>
                    {lead.lastContactAt ? (
                      <>
                        <span className="fu-contacted">Contacted</span>
                        <div className="fu-sub">
                          {new Date(lead.lastContactAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="fu-not-contacted">Not contacted yet</span>
                    )}
                  </CrmTable.Cell>
                  {teamView && scope === 'team' ? (
                    <CrmTable.Cell>
                      {getUserById(f.assignedStaffId)?.name ?? '—'}
                    </CrmTable.Cell>
                  ) : null}
                  <CrmTable.Cell className={crmTableActionsClass}>
                    <div className="crm-table-icon-actions">
                      <a
                        href={`tel:${lead.mobile}`}
                        className="crm-table-icon-btn"
                        title="Call"
                        aria-label={`Call ${lead.customerName}`}
                      >
                        <Phone size={17} strokeWidth={1.6} aria-hidden />
                      </a>
                      <a
                        href={`https://wa.me/91${lead.mobile.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="crm-table-icon-btn"
                        title="WhatsApp"
                        aria-label={`WhatsApp ${lead.customerName}`}
                      >
                        <MessageCircle size={17} strokeWidth={1.6} aria-hidden />
                      </a>
                      <Link
                        to={`/admin/leads/${lead.id}`}
                        className="crm-table-icon-btn"
                        title="Open lead"
                        aria-label={`Open ${lead.customerName}`}
                      >
                        <ExternalLink size={17} strokeWidth={1.6} aria-hidden />
                      </Link>
                      <button
                        type="button"
                        className="crm-table-icon-btn"
                        title="Mark done"
                        aria-label={`Mark follow-up done for ${lead.customerName}`}
                        onClick={() => markDone(f.id, lead.customerName)}
                      >
                        <CheckCircle2 size={17} strokeWidth={1.6} aria-hidden />
                      </button>
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
