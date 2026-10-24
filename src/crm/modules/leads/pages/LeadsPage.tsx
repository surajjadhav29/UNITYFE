import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Filter, Plus } from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { useCrmLayout } from '../../../context/CrmLayoutContext';
import { LeadStatusDropdown } from '../../../components/LeadStatusDropdown';
import { LeadPriorityDropdown } from '../../../components/LeadPriorityDropdown';
import { LeadsKanbanView } from '../../../components/LeadsKanbanView';
import {
  LeadsViewToggle,
  loadLeadsViewMode,
  saveLeadsViewMode,
  type LeadsViewMode,
} from '../../../components/LeadsViewToggle';
import { LeadAvatar } from '../components/LeadAvatar';
import { LeadSourceBadge } from '../components/LeadSourceBadge';
import { LeadQuickModal, type LeadQuickModalMode } from '../components/LeadQuickModal';
import { LeadsBulkBar } from '../components/LeadsBulkBar';
import { LeadTableRowActions } from '../components/LeadTableRowActions';
import { LeadsActiveFiltersRow } from '../components/LeadsActiveFiltersRow';
import { LeadsFiltersPanel } from '../components/LeadsFiltersPanel';
import {
  buildLeadFilterChips,
  countActiveLeadFilters,
  EMPTY_LEADS_FILTERS,
  removeLeadFilterChip,
  type LeadsFilterChip,
  type LeadsSheetFilters,
} from '../utils/leadsFilterUtils';
import {
  getDueFollowUpsForLeads,
  isHotPriority,
  isOverdue,
  isToday,
} from '../../../utils/followUpDue';
import { formatLeadBudget, interestedVehicleLabel } from '../../../utils/leadFormat';
import { downloadCsv, exportLeadsToCsv } from '../../../utils/leadInsights';
import {
  canBulkActions,
  canCreateLead,
  canDeleteLeads,
  canExportLeads,
  filterAssignableStaff,
} from '../../../utils/permissions';
import { CRM_LIST_PAGE_SIZE } from '../../../common/constants/pagination';
import type { LeadPriority, LeadStatus } from '../../../types/crm.types';
import {
  CrmTable,
  crmTableActionsClass,
  crmTableLinkClass,
} from '../../../common/components/CrmTable';
import '../../../styles/crm-leads.css';

type TabFilter = 'all' | 'new' | 'my' | 'hot' | 'due_today' | 'overdue' | 'won' | 'lost';

const PAGE_SIZE = CRM_LIST_PAGE_SIZE;

export function LeadsPage() {
  const {
    visibleLeads,
    getUserById,
    currentUser,
    updateLead,
    state,
    bulkAssignLeads,
    deleteLeads,
  } = useCrm();
  const { collapseSidebarForFilter, registerCloseLeadsFilter } = useCrmLayout();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<LeadsViewMode>(() => loadLeadsViewMode());
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [appliedFilters, setAppliedFilters] = useState<LeadsSheetFilters>(() => {
    const st = searchParams.get('status');
    if (st) {
      return { ...EMPTY_LEADS_FILTERS, statuses: [st] };
    }
    return { ...EMPTY_LEADS_FILTERS };
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<LeadsSheetFilters>({ ...EMPTY_LEADS_FILTERS });
  const [tab, setTab] = useState<TabFilter>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStaff, setBulkStaff] = useState('');
  const [modalLeadId, setModalLeadId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<LeadQuickModalMode>('view');
  const [page, setPage] = useState(1);
  const [bulkMessage, setBulkMessage] = useState('');

  const canBulk = canBulkActions(currentUser);
  const canExport = canExportLeads(currentUser);

  useEffect(() => {
    if (searchParams.get('hot') === '1') setTab('hot');
    const st = searchParams.get('status');
    if (st) {
      setAppliedFilters((prev) => ({ ...prev, statuses: [st] }));
    }
  }, [searchParams]);

  useEffect(() => {
    return registerCloseLeadsFilter(() => setFiltersOpen(false));
  }, [registerCloseLeadsFilter]);

  const counts = useMemo(() => {
    const active = visibleLeads.filter((l) => !['Won', 'Lost', 'On Hold'].includes(l.status));
    const hot = active.filter((l) => isHotPriority(l.priority));
    const dueItems = getDueFollowUpsForLeads(state.followUps, visibleLeads);
    const dueToday = dueItems.filter((d) => d.kind === 'today').length;
    const overdue = dueItems.filter((d) => d.kind === 'overdue').length;
    return {
      all: visibleLeads.length,
      new: visibleLeads.filter((l) => l.status === 'New').length,
      my: visibleLeads.filter((l) => l.assignedStaffId === currentUser?.id).length,
      hot: hot.length,
      dueToday,
      overdue,
      won: visibleLeads.filter((l) => l.status === 'Won').length,
      lost: visibleLeads.filter((l) => l.status === 'Lost').length,
    };
  }, [visibleLeads, state.followUps, currentUser?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = visibleLeads.filter((lead) => {
      if (appliedFilters.sources.length && !appliedFilters.sources.includes(lead.source)) {
        return false;
      }
      if (appliedFilters.statuses.length && !appliedFilters.statuses.includes(lead.status)) {
        return false;
      }
      if (appliedFilters.priorities.length && !appliedFilters.priorities.includes(lead.priority)) {
        return false;
      }
      if (
        appliedFilters.staffIds.length &&
        (!lead.assignedStaffId || !appliedFilters.staffIds.includes(lead.assignedStaffId))
      ) {
        return false;
      }

      if (tab === 'new' && lead.status !== 'New') return false;
      if (tab === 'my' && lead.assignedStaffId !== currentUser?.id) return false;
      if (tab === 'hot' && !isHotPriority(lead.priority)) return false;
      if (tab === 'won' && lead.status !== 'Won') return false;
      if (tab === 'lost' && lead.status !== 'Lost') return false;
      if (tab === 'due_today') {
        const fu = state.followUps.some(
          (f) =>
            f.leadId === lead.id &&
            f.status === 'Pending' &&
            isToday(f.scheduledAt),
        );
        if (!fu && !(lead.nextFollowUpAt && isToday(lead.nextFollowUpAt))) return false;
      }
      if (tab === 'overdue') {
        const fu = state.followUps.some(
          (f) => f.leadId === lead.id && f.status === 'Pending' && isOverdue(f.scheduledAt),
        );
        if (!fu && !(lead.nextFollowUpAt && isOverdue(lead.nextFollowUpAt))) return false;
      }

      if (!q) return true;
      return (
        lead.customerName.toLowerCase().includes(q) ||
        lead.mobile.includes(q) ||
        lead.id.toLowerCase().includes(q)
      );
    });
    return list.sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt).getTime();
      const tb = new Date(b.updatedAt || b.createdAt).getTime();
      if (tb !== ta) return tb - ta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    visibleLeads,
    search,
    appliedFilters,
    tab,
    currentUser?.id,
    state.followUps,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, appliedFilters]);

  const modalLead = modalLeadId
    ? visibleLeads.find((l) => l.id === modalLeadId) ?? null
    : null;

  const canDelete = canDeleteLeads(currentUser);

  const allPageSelected =
    paged.length > 0 && paged.every((l) => selected.includes(l.id));

  const staffOptions = filterAssignableStaff(state.users);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'new', label: 'New', count: counts.new },
    { key: 'my', label: 'My leads', count: counts.my },
    { key: 'hot', label: 'Hot', count: counts.hot },
    { key: 'due_today', label: 'Due today', count: counts.dueToday },
    { key: 'overdue', label: 'Overdue', count: counts.overdue },
    { key: 'won', label: 'Won', count: counts.won },
    { key: 'lost', label: 'Lost', count: counts.lost },
  ];

  function setView(mode: LeadsViewMode) {
    setViewMode(mode);
    saveLeadsViewMode(mode);
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function togglePageSelect() {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((id) => !paged.some((l) => l.id === id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...paged.map((l) => l.id)])]);
  }

  function handleStatusChange(leadId: string, nextStatus: LeadStatus) {
    const lead = visibleLeads.find((l) => l.id === leadId);
    if (!lead || lead.status === nextStatus) return;
    const patch: Parameters<typeof updateLead>[1] = { status: nextStatus };
    if (nextStatus === 'Lost' && !lead.lostReason) patch.lostReason = 'Other';
    if (nextStatus === 'On Hold' && !lead.onHoldReason) patch.onHoldReason = 'Awaiting customer';
    updateLead(leadId, patch);
  }

  function handlePriorityChange(leadId: string, nextPriority: LeadPriority) {
    const lead = visibleLeads.find((l) => l.id === leadId);
    if (!lead || lead.priority === nextPriority) return;
    updateLead(leadId, { priority: nextPriority });
  }

  function exportCsv() {
    const csv = exportLeadsToCsv(filtered, (id) => getUserById(id)?.name ?? 'Unassigned');
    downloadCsv(`drivenext-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  const activeFilterCount = countActiveLeadFilters(appliedFilters);

  const filterChips = useMemo(
    () =>
      buildLeadFilterChips(appliedFilters, (id) => getUserById(id)?.name ?? 'Unassigned'),
    [appliedFilters, getUserById],
  );

  function openFiltersSheet() {
    collapseSidebarForFilter();
    setFilterDraft({
      sources: [...appliedFilters.sources],
      statuses: [...appliedFilters.statuses],
      priorities: [...appliedFilters.priorities],
      staffIds: [...appliedFilters.staffIds],
    });
    setFiltersOpen(true);
  }

  function closeFiltersSheet() {
    setFiltersOpen(false);
  }

  function applySheetFilters() {
    setAppliedFilters({
      sources: [...filterDraft.sources],
      statuses: [...filterDraft.statuses],
      priorities: [...filterDraft.priorities],
      staffIds: [...filterDraft.staffIds],
    });
    setFiltersOpen(false);
  }

  function clearSheetFilters() {
    setFilterDraft({ ...EMPTY_LEADS_FILTERS });
    setAppliedFilters({ ...EMPTY_LEADS_FILTERS });
    setFiltersOpen(false);
  }

  function removeFilterChip(chip: LeadsFilterChip) {
    setAppliedFilters((prev) => removeLeadFilterChip(prev, chip));
  }

  function clearAllAppliedFilters() {
    setAppliedFilters({ ...EMPTY_LEADS_FILTERS });
  }

  function openLeadModal(leadId: string, mode: LeadQuickModalMode) {
    setModalLeadId(leadId);
    setModalMode(mode);
  }

  function closeLeadModal() {
    setModalLeadId(null);
    setModalMode('view');
  }

  function handleDeleteLead(leadId: string, name: string) {
    if (!window.confirm(`Delete lead “${name}”? This cannot be undone.`)) return;
    const r = deleteLeads([leadId]);
    setBulkMessage(r.ok ? 'Lead deleted.' : r.error);
    if (r.ok) {
      setSelected((prev) => prev.filter((id) => id !== leadId));
      if (modalLeadId === leadId) closeLeadModal();
    }
  }

  function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.length} selected lead(s)? This cannot be undone.`)) {
      return;
    }
    const r = deleteLeads(selected);
    setBulkMessage(r.ok ? `${selected.length} lead(s) deleted.` : r.error);
    if (r.ok) setSelected([]);
  }

  function getVehicleLabel(id: string) {
    const v = state.vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : undefined;
  }

  return (
    <div
      className="leads-shell"
    >
      <div className="leads-main">
        <div className="ld-leads-chrome">
          <div className="ld-toolbar ld-toolbar-main">
            <input
              className="ld-toolbar-search"
              placeholder="Search leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search leads"
            />
            <LeadsViewToggle mode={viewMode} onChange={setView} />
            {canCreateLead(currentUser) ? (
              <Link to="/admin/leads/new" className="crm-btn crm-btn-primary">
                <Plus size={16} aria-hidden />
                Add lead
              </Link>
            ) : null}
            <div className="ld-toolbar-actions">
              {canExport ? (
                <button type="button" className="crm-btn crm-btn-secondary crm-btn-sm" onClick={exportCsv}>
                  <Download size={15} aria-hidden />
                  Export
                </button>
              ) : null}
              <button
                type="button"
                className={`crm-btn crm-btn-secondary crm-btn-sm ld-filter-btn${activeFilterCount > 0 ? ' ld-filter-btn-active' : ''}`}
                onClick={openFiltersSheet}
              >
                <Filter size={15} aria-hidden />
                Filter
                {activeFilterCount > 0 ? (
                  <span className="ld-filter-badge">{activeFilterCount}</span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="ld-tabs" role="tablist">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`ld-tab${tab === key ? ' active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
                <span className="ld-tab-count">{count}</span>
              </button>
            ))}
          </div>

          <LeadsActiveFiltersRow
            chips={filterChips}
            onRemove={removeFilterChip}
            onClearAll={clearAllAppliedFilters}
          />
        </div>

        <div className="leads-body-row">
          <div className="leads-body-scroll">
        {bulkMessage ? <div className="crm-alert crm-alert-success">{bulkMessage}</div> : null}

        {canBulk && selected.length > 0 ? (
          <LeadsBulkBar
            selectedCount={selected.length}
            staffOptions={staffOptions}
            staffId={bulkStaff}
            onStaffChange={setBulkStaff}
            canDelete={canDelete}
            onAssign={() => {
              const r = bulkAssignLeads(selected, bulkStaff);
              const name = staffOptions.find((u) => u.id === bulkStaff)?.name ?? 'staff';
              setBulkMessage(
                r.ok ? `${selected.length} lead(s) assigned to ${name}.` : r.error,
              );
              if (r.ok) {
                setSelected([]);
                setBulkStaff('');
              }
            }}
            onDelete={handleBulkDelete}
            onClear={() => {
              setSelected([]);
              setBulkStaff('');
            }}
          />
        ) : null}

        {viewMode === 'card' ? (
          filtered.length === 0 ? (
            <p className="crm-empty">No leads match your filters.</p>
          ) : (
            <LeadsKanbanView
              leads={filtered}
              getStaffName={(id) => getUserById(id)?.name ?? 'Unassigned'}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              bulkSelect={canBulk}
              selectedIds={selected}
              onToggleSelect={toggle}
              onSelectLead={(l) => openLeadModal(l.id, 'view')}
              selectedLeadId={modalLeadId}
            />
          )
        ) : (
          <>
          <CrmTable stickyHeader>
              <CrmTable.Head>
                <tr>
                  {canBulk ? (
                    <CrmTable.HeadCell className="w-10">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={togglePageSelect}
                        aria-label="Select page"
                      />
                    </CrmTable.HeadCell>
                  ) : null}
                  <CrmTable.HeadCell>Lead name</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Phone</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Source</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Interested vehicle</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Budget</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Status</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Priority</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Assigned to</CrmTable.HeadCell>
                  <CrmTable.HeadCell>Next follow-up</CrmTable.HeadCell>
                  <CrmTable.HeadCell className={crmTableActionsClass}>Actions</CrmTable.HeadCell>
                </tr>
              </CrmTable.Head>
              <CrmTable.Body>
                {paged.map((lead) => {
                  const overdue =
                    lead.nextFollowUpAt &&
                    isOverdue(lead.nextFollowUpAt) &&
                    !['Won', 'Lost'].includes(lead.status);
                  const staff = getUserById(lead.assignedStaffId);
                  return (
                    <CrmTable.Row
                      key={lead.id}
                      selected={modalLeadId === lead.id}
                      interactive
                      onClick={() => openLeadModal(lead.id, 'view')}
                    >
                      {canBulk ? (
                        <CrmTable.Cell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.includes(lead.id)}
                            onChange={() => toggle(lead.id)}
                          />
                        </CrmTable.Cell>
                      ) : null}
                      <CrmTable.Cell>
                        <Link
                          to={`/admin/leads/${lead.id}`}
                          className={crmTableLinkClass}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.customerName}
                        </Link>
                      </CrmTable.Cell>
                      <CrmTable.Cell>{lead.mobile}</CrmTable.Cell>
                      <CrmTable.Cell>
                        <LeadSourceBadge source={lead.source} />
                      </CrmTable.Cell>
                      <CrmTable.Cell>{interestedVehicleLabel(lead, getVehicleLabel)}</CrmTable.Cell>
                      <CrmTable.Cell>{formatLeadBudget(lead)}</CrmTable.Cell>
                      <CrmTable.Cell onClick={(e) => e.stopPropagation()}>
                        <LeadStatusDropdown
                          leadId={lead.id}
                          status={lead.status}
                          onChange={handleStatusChange}
                        />
                      </CrmTable.Cell>
                      <CrmTable.Cell onClick={(e) => e.stopPropagation()}>
                        <LeadPriorityDropdown
                          leadId={lead.id}
                          priority={lead.priority}
                          onChange={handlePriorityChange}
                        />
                      </CrmTable.Cell>
                      <CrmTable.Cell>
                        {staff ? (
                          <div className="ld-staff-cell">
                            <LeadAvatar name={staff.name} size={26} />
                            {staff.name.split(' ')[0]}
                          </div>
                        ) : (
                          '—'
                        )}
                      </CrmTable.Cell>
                      <CrmTable.Cell className={overdue ? 'ld-follow-due' : undefined}>
                        {lead.nextFollowUpAt
                          ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </CrmTable.Cell>
                      <CrmTable.Cell
                        className={crmTableActionsClass}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LeadTableRowActions
                          lead={lead}
                          currentUser={currentUser}
                          onView={(l) => openLeadModal(l.id, 'view')}
                          onEdit={(l) => openLeadModal(l.id, 'edit')}
                          onDelete={(l) => handleDeleteLead(l.id, l.customerName)}
                        />
                      </CrmTable.Cell>
                    </CrmTable.Row>
                  );
                })}
              </CrmTable.Body>
          </CrmTable>
            {filtered.length === 0 ? (
              <p className="crm-empty" style={{ padding: '2rem' }}>
                No leads match your filters.
              </p>
            ) : (
              <div className="ld-pagination">
                <span>
                  Showing {(pageSafe - 1) * PAGE_SIZE + 1}–
                  {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} leads
                </span>
                <div className="ld-pagination-btns">
                  <button
                    type="button"
                    disabled={pageSafe <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 7) {
                      if (pageSafe <= 4) p = i + 1;
                      else if (pageSafe >= totalPages - 3) p = totalPages - 6 + i;
                      else p = pageSafe - 3 + i;
                    }
                    return (
                      <button
                        key={p}
                        type="button"
                        className={p === pageSafe ? 'active' : undefined}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
          </div>

          <LeadsFiltersPanel
            open={filtersOpen}
            onClose={closeFiltersSheet}
            draft={filterDraft}
            onChange={setFilterDraft}
            onApply={applySheetFilters}
            onClear={clearSheetFilters}
            staffOptions={staffOptions}
            showStaffFilter={canBulk}
          />
        </div>
      </div>

      <LeadQuickModal
        lead={modalLead}
        open={Boolean(modalLead)}
        mode={modalMode}
        onClose={closeLeadModal}
        onModeChange={setModalMode}
      />
    </div>
  );
}
