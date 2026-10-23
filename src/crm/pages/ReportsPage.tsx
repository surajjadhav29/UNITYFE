import { useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { LeadSourceChart } from '../components/LeadSourceChart';
import { PipelineFunnel } from '../components/PipelineFunnel';
import {
  downloadCsv,
  exportLeadsToCsv,
  getPipelineCounts,
  getSourceBreakdown,
} from '../utils/leadInsights';
import { formatINR } from '../../utils/format';
import { canViewReports } from '../utils/permissions';
import { Navigate } from 'react-router-dom';

export function ReportsPage() {
  const { visibleLeads, state, getUserById, currentUser } = useCrm();

  const pipeline = useMemo(() => getPipelineCounts(visibleLeads), [visibleLeads]);
  const sources = useMemo(() => getSourceBreakdown(visibleLeads), [visibleLeads]);

  if (!currentUser || !canViewReports(currentUser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  const converted = visibleLeads.filter((l) => l.status === 'Converted / Sold').length;
  const lost = visibleLeads.filter((l) => l.status === 'Lost').length;
  const closed = converted + lost;
  const rate = closed === 0 ? 0 : Math.round((converted / closed) * 100);

  function exportCsv() {
    const csv = exportLeadsToCsv(visibleLeads, (id) => getUserById(id)?.name ?? 'Unassigned');
    downloadCsv(`unity-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Reports</h1>
          <p className="crm-page-sub">Pipeline, lead sources, and export (admin)</p>
        </div>
        <div className="crm-actions">
          <button type="button" className="crm-btn crm-btn-primary" onClick={exportCsv}>
            Export leads CSV
          </button>
        </div>
      </header>

      <div className="crm-grid-cards">
        <div className="crm-stat-card">
          <div className="crm-stat-label">Conversion rate</div>
          <div className="crm-stat-value">{rate}%</div>
          <p className="crm-stat-hint">Converted ÷ (Converted + Lost)</p>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Total leads</div>
          <div className="crm-stat-value">{visibleLeads.length}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Available stock</div>
          <div className="crm-stat-value">
            {state.vehicles.filter((v) => v.availability === 'Available').length}
          </div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Stock value (listed)</div>
          <div className="crm-stat-value" style={{ fontSize: '1.25rem' }}>
            {formatINR(
              state.vehicles
                .filter((v) => v.availability === 'Available')
                .reduce((s, v) => s + v.sellingPrice, 0),
            )}
          </div>
        </div>
      </div>

      <div className="crm-detail-grid">
        <section className="crm-panel">
          <h2 className="crm-panel-title">Sales pipeline</h2>
          <PipelineFunnel counts={pipeline} total={visibleLeads.length} />
        </section>
        <section className="crm-panel">
          <h2 className="crm-panel-title">Lead sources</h2>
          <LeadSourceChart data={sources} />
        </section>
      </div>
    </>
  );
}
