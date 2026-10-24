import { useMemo, useState } from 'react';
import { CrmTable } from '../common/components/CrmTable';
import { useCrm } from '../context/CrmContext';

export function LogsPage() {
  const { state, getUserById, resetData } = useCrm();
  const [actionFilter, setActionFilter] = useState('');

  const logs = useMemo(() => {
    return state.auditLogs.filter((log) =>
      actionFilter ? log.action.includes(actionFilter) : true,
    );
  }, [state.auditLogs, actionFilter]);

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Audit logs</h1>
          <p className="crm-page-sub">Important actions (demo, stored locally)</p>
        </div>
        <div className="crm-actions">
          <button
            type="button"
            className="crm-btn crm-btn-danger"
            onClick={() => {
              if (window.confirm('Reset all CRM demo data? You will be signed out.')) {
                resetData();
                window.location.href = '/admin/login';
              }
            }}
          >
            Reset demo data
          </button>
        </div>
      </header>

      <div className="crm-filters">
        <input
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />
      </div>

      <CrmTable stickyHeader>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Record</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                <td>{getUserById(log.actorId)?.name ?? log.actorId}</td>
                <td>{log.action}</td>
                <td>
                  {log.recordType}/{log.recordId}
                </td>
                <td>{log.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
      </CrmTable>
        {logs.length === 0 ? <p className="crm-empty">No log entries.</p> : null}
    </>
  );
}
