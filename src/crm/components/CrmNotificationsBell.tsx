import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { getNeedsAttention } from '../utils/leadInsights';
import { attentionReasonLabel } from '../utils/leadInsights';

export function CrmNotificationsBell() {
  const { visibleLeads, state } = useCrm();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => getNeedsAttention(visibleLeads, state.followUps).slice(0, 12),
    [visibleLeads, state.followUps],
  );

  return (
    <div className="crm-notify-wrap">
      <button
        type="button"
        className="crm-notify-btn"
        aria-label={`${items.length} items need attention`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} aria-hidden />
        {items.length > 0 ? <span className="crm-notify-badge">{items.length}</span> : null}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="crm-notify-backdrop"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="crm-notify-panel">
            <strong>Needs attention</strong>
            {items.length === 0 ? (
              <p className="crm-empty" style={{ padding: '1rem 0' }}>
                All caught up.
              </p>
            ) : (
              <ul>
                {items.map(({ lead, reasons }) => (
                  <li key={lead.id}>
                    <Link to={`/admin/leads/${lead.id}`} onClick={() => setOpen(false)}>
                      {lead.customerName}
                      <span>{attentionReasonLabel(reasons[0])}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/dashboard" className="crm-link" onClick={() => setOpen(false)}>
              Open dashboard
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
