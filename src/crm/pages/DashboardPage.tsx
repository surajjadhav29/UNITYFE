import { Link } from 'react-router-dom';
import { useMemo, useState, type ReactNode } from 'react';
import { Flame, PhoneCall, UserPlus, Users, CalendarDays } from 'lucide-react';
import { CrmTable } from '../common/components/CrmTable';
import { useCrm } from '../context/CrmContext';
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard';
import { DashboardSection } from '../components/dashboard/DashboardSection';
import { DashboardSectionsGrid } from '../components/dashboard/DashboardSectionsGrid';
import { DonutChart } from '../components/dashboard/DonutChart';
import { LeadIntakeSummary } from '../components/dashboard/LeadIntakeSummary';
import { PipelineSnapshot } from '../components/dashboard/PipelineSnapshot';
import { StockAtAGlance } from '../components/dashboard/StockAtAGlance';
import { TeamWorkloadTable } from '../components/dashboard/TeamWorkloadTable';
import { formatINR } from '../../utils/format';
import { getDueFollowUpsForLeads, isHotPriority, isToday } from '../utils/followUpDue';
import {
  getSourceBreakdown,
  leadStatsForVehicle,
  stockDaysListed,
} from '../utils/leadInsights';
import {
  defaultDashboardDateRange,
  formatDateInput,
  inDateRange,
  leadCreatedOnDay,
  trendBucketsForRange,
} from '../utils/dashboardMetrics';
import { isTeamLead, roleLabel, shouldFilterDashboardToSelf } from '../utils/permissions';
import { VehicleStatusBadge } from '../components/StatusBadge';
import {
  loadDashboardSectionOrder,
  type DashboardSectionId,
} from '../utils/dashboardSectionOrder';
import '../styles/crm-dashboard.css';

const SOURCE_COLORS: Record<string, string> = {
  OLX: '#f97316',
  Cars24: '#22c55e',
  CarWale: '#06b6d4',
  Website: '#3b82f6',
  'Phone Call': '#8b5cf6',
  'Walk-in': '#ec4899',
  WhatsApp: '#25d366',
  Facebook: '#1877f2',
  Instagram: '#e1306c',
  Referral: '#64748b',
  Other: '#94a3b8',
};

function formatRangeHint(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${new Date(start).toLocaleDateString('en-IN', opts)} – ${new Date(end).toLocaleDateString('en-IN', opts)}`;
}

export function DashboardPage() {
  const { visibleLeads, visibleAppointments, state, currentUser } = useCrm();
  const showTeam = isTeamLead(currentUser);
  const userId = shouldFilterDashboardToSelf(currentUser) ? currentUser?.id : undefined;
  const [startDate, setStartDate] = useState(() => defaultDashboardDateRange().start);
  const [endDate, setEndDate] = useState(() => defaultDashboardDateRange().end);
  const [sectionOrder, setSectionOrder] = useState(() => loadDashboardSectionOrder());
  const todayYmd = formatDateInput(new Date());
  const rangeHint = formatRangeHint(startDate, endDate);

  function onStartDateChange(next: string) {
    setStartDate(next);
    if (next > endDate) setEndDate(next);
  }

  function onEndDateChange(next: string) {
    setEndDate(next);
    if (next < startDate) setStartDate(next);
  }

  const dueItems = useMemo(
    () => getDueFollowUpsForLeads(state.followUps, visibleLeads, userId),
    [state.followUps, visibleLeads, userId],
  );

  const metrics = useMemo(() => {
    const active = visibleLeads.filter((l) => !['Won', 'Lost'].includes(l.status));
    const newToday = visibleLeads.filter((l) => isToday(l.createdAt));
    const hot = active.filter((l) => isHotPriority(l.priority));
    const overdueCount = dueItems.filter((d) => d.kind === 'overdue').length;
    const todayFu = dueItems.filter((d) => d.kind === 'today').length;
    const apptToday = visibleAppointments.filter(
      (a) =>
        isToday(a.scheduledAt) &&
        !['Cancelled', 'Completed', 'No-show'].includes(a.status),
    ).length;
    return {
      active,
      newToday,
      hot,
      overdueCount,
      todayFu,
      apptToday,
    };
  }, [visibleLeads, dueItems, visibleAppointments]);

  const leadTrend = useMemo(
    () =>
      trendBucketsForRange(startDate, endDate, (dayStart) =>
        visibleLeads.filter((l) => leadCreatedOnDay(l.createdAt, dayStart)).length,
      ),
    [visibleLeads, startDate, endDate],
  );

  const scopedLeads = useMemo(
    () => visibleLeads.filter((l) => inDateRange(l.createdAt, startDate, endDate)),
    [visibleLeads, startDate, endDate],
  );

  const sourceDonut = useMemo(() => {
    const data = getSourceBreakdown(scopedLeads);
    return data.map(({ source, count }) => ({
      label: source,
      value: count,
      color: SOURCE_COLORS[source] ?? '#94a3b8',
    }));
  }, [scopedLeads]);

  const followUpRows = useMemo(() => {
    const rows = [...dueItems.filter((d) => d.kind === 'today' || d.kind === 'overdue')];
    return rows.slice(0, 8).map(({ followUp, lead, kind }) => ({
      id: followUp.id,
      time: new Date(followUp.scheduledAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      name: lead.customerName,
      leadId: lead.id,
      type: followUp.type,
      status: kind === 'overdue' ? 'Overdue' : 'Pending',
    }));
  }, [dueItems]);

  const upcomingAppts = useMemo(() => {
    const now = Date.now();
    return visibleAppointments
      .filter(
        (a) =>
          new Date(a.scheduledAt).getTime() >= now &&
          !['Cancelled', 'Completed', 'No-show'].includes(a.status),
      )
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 8)
      .map((a) => {
        const lead = state.leads.find((l) => l.id === a.leadId);
        const vehicle = a.vehicleId
          ? state.vehicles.find((v) => v.id === a.vehicleId)
          : undefined;
        return {
          id: a.id,
          time: new Date(a.scheduledAt).toLocaleString('en-IN', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          name: lead?.customerName ?? '—',
          vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
          type: a.type,
          status: a.status,
        };
      });
  }, [visibleAppointments, state.leads, state.vehicles]);

  const recentVehicles = useMemo(
    () =>
      [...state.vehicles]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [state.vehicles],
  );

  const stockCounts = useMemo(() => {
    const available = state.vehicles.filter((v) => v.availability === 'Available').length;
    const reserved = state.vehicles.filter((v) => v.availability === 'Reserved').length;
    const sold = state.vehicles.filter((v) => v.availability === 'Sold').length;
    return { available, reserved, sold };
  }, [state.vehicles]);

  const stockStats = useMemo(() => {
    const available = state.vehicles.filter((v) => v.availability === 'Available');
    const ages = available.map(stockDaysListed);
    const oldest = ages.length ? Math.max(...ages) : 0;
    const avg = ages.length ? Math.round(ages.reduce((s, n) => s + n, 0) / ages.length) : 0;
    return { oldest, avg, total: state.vehicles.length };
  }, [state.vehicles]);

  const teamRows = useMemo(() => {
    if (!showTeam) return [];
    return state.users
      .filter((u) => u.status === 'active' && u.role !== 'admin')
      .map((u) => {
        const leads = state.leads.filter((l) => l.assignedStaffId === u.id);
        const openLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status)).length;
        const followUps = state.followUps.filter((f) => f.assignedStaffId === u.id);
        const appts = state.appointments.filter((a) => a.assignedStaffId === u.id);
        const sales = state.bookings.filter(
          (b) => b.assignedStaffId === u.id && b.status === 'Sold/Delivered',
        ).length;
        return {
          id: u.id,
          name: u.name,
          role: roleLabel(u.role),
          leads: openLeads,
          followUps: followUps.length,
          appts: appts.length,
          sales,
        };
      });
  }, [showTeam, state]);

  const dashboardSections = useMemo((): Partial<Record<DashboardSectionId, ReactNode>> => {
    return {
      'lead-trend': (
        <DashboardSection
          title="New enquiries over time"
          subtitle={`Uses your selected dates (${rangeHint})`}
          viewAllTo="/admin/leads"
        >
          <LeadIntakeSummary
            buckets={leadTrend}
            totalInRange={scopedLeads.length}
            startDate={startDate}
            endDate={endDate}
          />
        </DashboardSection>
      ),
      'lead-sources': (
        <DashboardSection
          title="Where customers came from"
          subtitle={`New enquiries in ${rangeHint} — OLX, website, walk-in, etc.`}
          viewAllTo="/admin/leads"
        >
          {sourceDonut.length === 0 ? (
            <p className="dn-empty">No enquiries in this date range.</p>
          ) : (
            <DonutChart
              segments={sourceDonut}
              centerValue={scopedLeads.length}
              centerLabel="Enquiries"
            />
          )}
        </DashboardSection>
      ),
      'lead-status': (
        <DashboardSection title="Enquiry pipeline" subtitle="Live picture of all customers in CRM" viewAllTo="/admin/leads">
          <PipelineSnapshot leads={visibleLeads} />
        </DashboardSection>
      ),
      pipeline: showTeam ? (
        <DashboardSection
          title="Team workload"
          subtitle="Who is handling how many customers"
          viewAllTo="/admin/users"
          bodyClassName="dn-card-body--table-flush"
        >
          <TeamWorkloadTable rows={teamRows} />
        </DashboardSection>
      ) : (
        <DashboardSection title="Your work today" subtitle="Quick snapshot for you" viewAllTo="/admin/leads">
          <p className="dn-muted">
            You are working on <strong>{metrics.active.length}</strong> open customers.{' '}
            <strong>{metrics.todayFu}</strong> need a call today
            {metrics.overdueCount > 0 ? (
              <>
                {' '}
                and <strong>{metrics.overdueCount}</strong> are overdue
              </>
            ) : null}
            .
          </p>
          <Link to="/admin/leads/new" className="crm-btn crm-btn-primary">
            + Add enquiry
          </Link>
        </DashboardSection>
      ),
      'follow-ups': (
        <DashboardSection
          title="Call customers back"
          subtitle="Due today or already overdue — tap a name to open"
          viewAllTo="/admin/follow-ups"
          bodyClassName="dn-card-body--table-flush"
        >
          {followUpRows.length === 0 ? (
            <p className="dn-empty">No callbacks due today. You are up to date.</p>
          ) : (
            <CrmTable variant="embedded" wrapClassName="dn-data-table-scroll" stickyHeader>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th className="dn-col-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {followUpRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.time}</td>
                      <td>
                        <Link to={`/admin/leads/${r.leadId}`}>{r.name}</Link>
                      </td>
                      <td>
                        <span className={`dn-pill ${r.status === 'Overdue' ? 'danger' : 'warn'}`}>
                          {r.status === 'Overdue' ? 'Overdue — call now' : 'Due today'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </CrmTable>
          )}
        </DashboardSection>
      ),
      appointments: (
        <DashboardSection
          title="Upcoming test drives & visits"
          subtitle="Next scheduled meetings with customers"
          viewAllTo="/admin/appointments"
          bodyClassName="dn-card-body--table-flush"
        >
          {upcomingAppts.length === 0 ? (
            <p className="dn-empty">Nothing scheduled ahead. Book from a customer enquiry.</p>
          ) : (
            <CrmTable variant="embedded" wrapClassName="dn-data-table-scroll" stickyHeader>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th className="dn-col-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppts.map((r) => (
                    <tr key={r.id}>
                      <td>{r.time}</td>
                      <td>{r.name}</td>
                      <td>{r.vehicle}</td>
                      <td>
                        <span className="dn-pill ok">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </CrmTable>
          )}
        </DashboardSection>
      ),
      'recent-vehicles': (
        <DashboardSection
          title="Latest cars in stock"
          subtitle="Recently added to your inventory"
          viewAllTo="/admin/vehicles"
        >
          <ul className="dn-vehicle-list">
            {recentVehicles.map((v) => {
              const leadStats = leadStatsForVehicle(v.id, visibleLeads);
              return (
              <li key={v.id}>
                <img src={v.image} alt="" className="dn-vehicle-thumb" />
                <div>
                  <Link to={`/admin/vehicles/${v.id}/edit`}>
                    {v.brand} {v.model}
                  </Link>
                  <span className="dn-cell-sub">
                    {v.year} · {v.fuelType} · {v.kilometres.toLocaleString('en-IN')} km
                  </span>
                  <strong>{formatINR(v.sellingPrice)}</strong>
                  <span className="dn-cell-sub">
                    {leadStats.open > 0
                      ? `${leadStats.open} open lead${leadStats.open === 1 ? '' : 's'}${
                          leadStats.hot > 0 ? ` · Hot ${leadStats.hot}` : ''
                        }`
                      : 'No leads mapped yet'}
                  </span>
                </div>
                <VehicleStatusBadge status={v.availability} />
              </li>
              );
            })}
          </ul>
        </DashboardSection>
      ),
      'stock-overview': (
        <DashboardSection title="Stock at a glance" viewAllTo="/admin/vehicles">
          <StockAtAGlance
            available={stockCounts.available}
            reserved={stockCounts.reserved}
            sold={stockCounts.sold}
            oldestDays={stockStats.oldest}
          />
        </DashboardSection>
      ),
    };
  }, [
    followUpRows,
    leadTrend,
    startDate,
    endDate,
    metrics.active.length,
    metrics.todayFu,
    rangeHint,
    recentVehicles,
    scopedLeads.length,
    showTeam,
    sourceDonut,
    stockCounts,
    stockStats,
    teamRows,
    upcomingAppts,
    visibleLeads,
  ]);

  return (
    <div className="dn-dashboard">
      <header className="dn-dashboard-head dn-dashboard-head-compact">
        <div className="dn-date-filters">
          <label className="dn-date-field">
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </label>
          <label className="dn-date-field">
            <span>End date</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={todayYmd}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </label>
        </div>
      </header>

      <p className="dn-dashboard-context">
        Numbers with <strong>{rangeHint}</strong> follow your date filters above.{' '}
        <strong>Today</strong> and <strong>open pipeline</strong> cards show the live situation now.
      </p>

      <div className="dn-kpi-grid">
        <DashboardKpiCard
          label="New enquiries (selected dates)"
          value={scopedLeads.length}
          hint={`Customer leads added ${rangeHint}`}
          icon={Users}
          accent="#dbeafe"
          to="/admin/leads"
        />
        <DashboardKpiCard
          label="New enquiries today"
          value={metrics.newToday.length}
          hint="Fresh leads that arrived today"
          icon={UserPlus}
          accent="#dcfce7"
          to="/admin/leads"
        />
        <DashboardKpiCard
          label="Open pipeline"
          value={metrics.active.length}
          hint="Still working — not won or lost"
          icon={Users}
          accent="#e0e7ff"
          to="/admin/leads"
        />
        <DashboardKpiCard
          label="Hot customers"
          value={metrics.hot.length}
          hint="High priority — close the deal soon"
          icon={Flame}
          accent="#ffedd5"
          to="/admin/leads?hot=1"
        />
        <DashboardKpiCard
          label="Callbacks needed"
          value={metrics.todayFu + metrics.overdueCount}
          hint={`${metrics.todayFu} due today · ${metrics.overdueCount} overdue`}
          icon={PhoneCall}
          accent="#fee2e2"
          to="/admin/follow-ups"
        />
        <DashboardKpiCard
          label="Visits today"
          value={metrics.apptToday}
          hint="Test drives & appointments scheduled today"
          icon={CalendarDays}
          accent="#ccfbf1"
          to="/admin/appointments"
        />
      </div>

      <DashboardSectionsGrid
        order={sectionOrder}
        onOrderChange={setSectionOrder}
        sections={dashboardSections}
      />
    </div>
  );
}
