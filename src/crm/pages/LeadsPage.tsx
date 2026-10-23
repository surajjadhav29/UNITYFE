import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Filter, Plus } from 'lucide-react';
import { CrmSideSheet } from '../components/CrmSideSheet';
import { FollowUpTodayBanner } from '../components/FollowUpTodayBanner';
import { PriorityBadge } from '../components/PriorityBadge';
import { ShareStockWhatsAppSheet } from '../components/ShareStockWhatsAppSheet';
import { LeadWhatsAppButton } from '../components/LeadWhatsAppButton';
import { useCrm } from '../context/CrmContext';
import { LEAD_SOURCES, LEAD_STATUSES } from '../constants';
import { LeadStatusDropdown } from '../components/LeadStatusDropdown';
import { getDueFollowUpsForLeads, isHotPriority, isOverdue, isToday } from '../utils/followUpDue';
import {
  downloadCsv,
  exportLeadsToCsv,
  getNeedsAttention,
} from '../utils/leadInsights';
import { NeedsAttentionPanel } from '../components/NeedsAttentionPanel';
import { LeadsKanbanView } from '../components/LeadsKanbanView';
import {
  LeadsViewToggle,
  loadLeadsViewMode,
  saveLeadsViewMode,
  type LeadsViewMode,
} from '../components/LeadsViewToggle';
import {
  canBulkActions,
  canCreateLead,
  filterAssignableStaff,
  shouldFilterDashboardToSelf,
} from '../utils/permissions';
import type { Lead, LeadStatus } from '../types/crm.types';
import { formatINR } from '../../utils/format';

type QuickFilter = '' | 'overdue' | 'new_today' | 'unassigned' | 'stale';

export function LeadsPage() {
  const {
    visibleLeads,
    getUserById,
    currentUser,
    updateLead,
    state,
    bulkAssignLeads,
    deleteLeads,
    addActivity,
  } = useCrm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<LeadsViewMode>(() => loadLeadsViewMode());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('');
  const [source, setSource] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStaff, setBulkStaff] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hotOnly, setHotOnly] = useState(false);
  const [whatsappLead, setWhatsappLead] = useState<Lead | null>(null);
  const [bulkMessage, setBulkMessage] = useState('');

  const canBulk = canBulkActions(currentUser);

  useEffect(() => {
    const q = searchParams.get('status');
    if (q && q !== status) setStatus(q);
  }, [searchParams, status]);

  const attention = useMemo(
    () => getNeedsAttention(visibleLeads, state.followUps).slice(0, 5),
    [visibleLeads, state.followUps],
  );

  const activeFilterCount = [status, source, staffFilter, hotOnly ? 'hot' : '', quickFilter]
    .filter(Boolean).length;

  const MS_DAY = 86400000;
  function daysSince(iso: string | undefined) {
    if (!iso) return 999;
    return Math.floor((Date.now() - new Date(iso).getTime()) / MS_DAY);
  }

  const dueItems = useMemo(
    () =>
      getDueFollowUpsForLeads(
        state.followUps,
        visibleLeads,
        shouldFilterDashboardToSelf(currentUser) ? currentUser?.id : undefined,
      ),
    [state.followUps, visibleLeads, currentUser],
  );
  const dueToday = dueItems.filter((d) => d.kind === 'today');
  const dueOverdue = dueItems.filter((d) => d.kind === 'overdue');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleLeads.filter((lead) => {
      if (hotOnly && !isHotPriority(lead.priority)) return false;
      if (status && lead.status !== status) return false;
      if (source && lead.source !== source) return false;
      if (staffFilter && lead.assignedStaffId !== staffFilter) return false;
      if (quickFilter === 'unassigned' && lead.assignedStaffId) return false;
      if (quickFilter === 'new_today' && !(isToday(lead.createdAt) && lead.status === 'New Lead')) {
        return false;
      }
      if (quickFilter === 'overdue') {
        if (['Converted / Sold', 'Lost'].includes(lead.status)) return false;
        const leadOverdue = Boolean(lead.nextFollowUpAt && isOverdue(lead.nextFollowUpAt));
        const fuOverdue = state.followUps.some(
          (f) =>
            f.leadId === lead.id && f.status === 'Scheduled' && isOverdue(f.scheduledAt),
        );
        if (!leadOverdue && !fuOverdue) return false;
      }
      if (quickFilter === 'stale') {
        const last = lead.lastContactAt ?? lead.createdAt;
        if (daysSince(last) < 7 || ['Converted / Sold', 'Lost', 'On Hold'].includes(lead.status)) {
          return false;
        }
      }
      if (!q) return true;
      return (
        lead.customerName.toLowerCase().includes(q) ||
        lead.mobile.includes(q) ||
        lead.id.toLowerCase().includes(q)
      );
    });
  }, [visibleLeads, search, status, source, staffFilter, hotOnly, quickFilter, state.followUps]);

  const filteredIds = useMemo(() => filtered.map((l) => l.id), [filtered]);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));

  const staffOptions = filterAssignableStaff(state.users);

  function setView(mode: LeadsViewMode) {
    setViewMode(mode);
    saveLeadsViewMode(mode);
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelected((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...filteredIds])]);
  }

  function applyBulkAssign() {
    if (!bulkStaff || !canBulk) return;
    const name = getUserById(bulkStaff)?.name ?? 'staff';
    const ok = window.confirm(`Assign ${selected.length} leads to ${name}?`);
    if (!ok) return;
    const result = bulkAssignLeads(selected, bulkStaff);
    if (!result.ok) {
      setBulkMessage(result.error);
      return;
    }
    setBulkMessage(`${selected.length} leads assigned.`);
    setSelected([]);
    setBulkStaff('');
  }

  function applyBulkDelete() {
    if (!canBulk) return;
    const ok = window.confirm(
      `Delete ${selected.length} leads permanently? This cannot be undone in demo data.`,
    );
    if (!ok) return;
    const result = deleteLeads(selected);
    if (!result.ok) {
      setBulkMessage(result.error);
      return;
    }
    setBulkMessage(`${selected.length} leads deleted.`);
    setSelected([]);
  }

  function clearFilters() {
    setStatus('');
    setSource('');
    setStaffFilter('');
    setHotOnly(false);
    setQuickFilter('');
    setSearchParams({});
  }

  function exportCsv() {
    const csv = exportLeadsToCsv(filtered, (id) => getUserById(id)?.name ?? 'Unassigned');
    downloadCsv(`unity-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  function applyStatusFilter(next: string) {
    setStatus(next);
    if (next) setSearchParams({ status: next });
    else setSearchParams({});
  }

  function handleStatusChange(leadId: string, nextStatus: LeadStatus) {
    const lead = visibleLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === nextStatus) return;
    const patch: Parameters<typeof updateLead>[1] = { status: nextStatus };
    if (nextStatus === 'Lost' && !lead.lostReason) {
      patch.lostReason = 'Other';
    }
    updateLead(leadId, patch);
  }

  function onStockShared(leadId: string, vehicleId: string) {
    updateLead(leadId, { interestedVehicleId: vehicleId });
    addActivity(leadId, {
      type: 'note',
      title: 'Stock shared on WhatsApp',
      detail: `Vehicle ${vehicleId} sent from leads list.`,
    });
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Leads</h1>
          <p className="crm-page-sub">
            {filtered.length} lead{filtered.length === 1 ? '' : 's'}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active` : ''}
          </p>
        </div>
        <div className="crm-actions">
          {canBulk ? (
            <button type="button" className="crm-btn crm-btn-secondary" onClick={exportCsv}>
              <Download size={16} aria-hidden />
              Export
            </button>
          ) : null}
          <LeadsViewToggle mode={viewMode} onChange={setView} />
          {canCreateLead(currentUser) ? (
            <Link to="/admin/leads/new" className="crm-btn crm-btn-primary">
              <Plus size={16} aria-hidden />
              New lead
            </Link>
          ) : null}
        </div>
      </header>

      {attention.length > 0 ? (
        <NeedsAttentionPanel items={attention} max={5} title="Priority queue" />
      ) : null}

      <FollowUpTodayBanner today={dueToday} overdue={dueOverdue} />

      <div className="crm-quick-filters">
        {(
          [
            ['', 'All'],
            ['overdue', 'Overdue'],
            ['new_today', 'New today'],
            ['unassigned', 'Unassigned'],
            ['stale', 'Stale 7d+'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key || 'all'}
            type="button"
            className={`crm-quick-filter-btn${quickFilter === key ? ' active' : ''}`}
            onClick={() => setQuickFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {bulkMessage ? <div className="crm-alert crm-alert-success">{bulkMessage}</div> : null}

      <div className="crm-filters">
        <input
          className="crm-filters-search"
          placeholder="Search name, mobile, lead ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search leads"
        />
        <button
          type="button"
          className="crm-btn crm-btn-secondary crm-filter-btn"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter size={16} aria-hidden />
          Filters
          {activeFilterCount > 0 ? (
            <span className="crm-filter-badge" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {activeFilterCount > 0 ? (
        <div className="crm-active-filters" style={{ marginBottom: '0.85rem' }}>
          {status ? <span className="crm-active-filter-chip">Status: {status}</span> : null}
          {source ? <span className="crm-active-filter-chip">Source: {source}</span> : null}
          {staffFilter ? (
            <span className="crm-active-filter-chip">
              Staff: {getUserById(staffFilter)?.name ?? staffFilter}
            </span>
          ) : null}
          {hotOnly ? <span className="crm-active-filter-chip">Hot / High priority</span> : null}
          <button type="button" className="crm-link" onClick={clearFilters}>
            Clear all
          </button>
        </div>
      ) : null}

      <CrmSideSheet
        open={filtersOpen}
        title="Filter leads"
        onClose={() => setFiltersOpen(false)}
        footer={
          <>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={clearFilters}>
              Clear all
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              onClick={() => setFiltersOpen(false)}
            >
              Show {filtered.length} leads
            </button>
          </>
        }
      >
        <div className="crm-sheet-field">
          <label htmlFor="lead-filter-status">Status</label>
          <select
            id="lead-filter-status"
            value={status}
            onChange={(e) => applyStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="crm-sheet-field">
          <label htmlFor="lead-filter-source">Source</label>
          <select
            id="lead-filter-source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {canBulk ? (
          <div className="crm-sheet-field">
            <label htmlFor="lead-filter-staff">Assigned staff</label>
            <select
              id="lead-filter-staff"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="">All staff</option>
              {staffOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="crm-sheet-field">
          <label className="crm-check-row">
            <input
              type="checkbox"
              checked={hotOnly}
              onChange={(e) => setHotOnly(e.target.checked)}
            />
            Show only hot / high priority leads
          </label>
        </div>
      </CrmSideSheet>

      {canBulk && selected.length > 0 ? (
        <div className="crm-bulk-bar">
          <span className="crm-bulk-count">{selected.length} selected</span>
          <select value={bulkStaff} onChange={(e) => setBulkStaff(e.target.value)} aria-label="Bulk assign to">
            <option value="">Assign to…</option>
            {staffOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={applyBulkAssign}>
            Bulk assign
          </button>
          <button type="button" className="crm-btn crm-btn-danger" onClick={applyBulkDelete}>
            Delete selected
          </button>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setSelected([])}>
            Clear selection
          </button>
        </div>
      ) : null}

      <ShareStockWhatsAppSheet
        open={Boolean(whatsappLead)}
        lead={whatsappLead}
        vehicles={state.vehicles}
        onClose={() => setWhatsappLead(null)}
        onShared={onStockShared}
      />

      {viewMode === 'card' ? (
        filtered.length === 0 ? (
          <p className="crm-empty">No leads match filters.</p>
        ) : (
          <LeadsKanbanView
            leads={filtered}
            getStaffName={(id) => getUserById(id)?.name ?? 'Unassigned'}
            onStatusChange={handleStatusChange}
            bulkSelect={canBulk}
            selectedIds={selected}
            onToggleSelect={toggle}
            onWhatsApp={(lead) => setWhatsappLead(lead)}
          />
        )
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                {canBulk ? (
                  <th scope="col">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      aria-label="Select all visible leads"
                    />
                  </th>
                ) : null}
                <th>Lead ID</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Mobile</th>
                <th>Source</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Next follow-up</th>
                <th>WhatsApp</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const overdue =
                  lead.nextFollowUpAt &&
                  new Date(lead.nextFollowUpAt).getTime() < Date.now() &&
                  !['Converted / Sold', 'Lost'].includes(lead.status);
                return (
                  <tr
                    key={lead.id}
                    className={isHotPriority(lead.priority) ? 'crm-row-hot' : undefined}
                  >
                    {canBulk ? (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(lead.id)}
                          onChange={() => toggle(lead.id)}
                          aria-label={`Select ${lead.id}`}
                        />
                      </td>
                    ) : null}
                    <td>
                      <Link to={`/admin/leads/${lead.id}`} className="crm-link">
                        {lead.id}
                      </Link>
                    </td>
                    <td>{lead.customerName}</td>
                    <td>
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td>{lead.mobile}</td>
                    <td>{lead.source}</td>
                    <td>{getUserById(lead.assignedStaffId)?.name ?? '—'}</td>
                    <td>
                      <LeadStatusDropdown
                        leadId={lead.id}
                        status={lead.status}
                        onChange={handleStatusChange}
                      />
                    </td>
                    <td>{lead.budget ? formatINR(lead.budget) : '—'}</td>
                    <td style={overdue ? { color: '#b91c1c', fontWeight: 600 } : undefined}>
                      {lead.nextFollowUpAt
                        ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN')
                        : '—'}
                    </td>
                    <td>
                      <LeadWhatsAppButton
                        label={`Share car with ${lead.customerName}`}
                        onClick={() => setWhatsappLead(lead)}
                      />
                    </td>
                    <td>
                      <Link to={`/admin/leads/${lead.id}/edit`} className="crm-link">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="crm-empty">No leads match filters.</p> : null}
        </div>
      )}
    </>
  );
}
