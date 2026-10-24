import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { attentionReasonLabel, getNeedsAttention } from '../utils/leadInsights';

interface CrmNotificationsBellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrmNotificationsBell({ open, onOpenChange }: CrmNotificationsBellProps) {
  const { visibleLeads, state } = useCrm();

  const items = useMemo(
    () => getNeedsAttention(visibleLeads, state.followUps).slice(0, 12),
    [visibleLeads, state.followUps],
  );

  function close() {
    onOpenChange(false);
  }

  return (
    <div className="crm-notify-wrap">
      <button
        type="button"
        className="crm-notify-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${items.length} items need attention`}
        onClick={() => onOpenChange(!open)}
      >
        <Bell size={18} strokeWidth={1.75} aria-hidden />
        {items.length > 0 ? (
          <span className="crm-notify-badge">{items.length > 99 ? '99+' : items.length}</span>
        ) : null}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="crm-notify-backdrop"
            aria-label="Close notifications"
            onClick={close}
          />
          <div className="crm-notify-panel" role="dialog" aria-label="Needs attention">
            <div className="crm-notify-panel-head">
              <strong>Needs attention</strong>
              <button type="button" className="crm-notify-panel-close" onClick={close} aria-label="Close">
                <X size={16} aria-hidden />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="crm-empty" style={{ padding: '0.75rem 0' }}>
                All caught up.
              </p>
            ) : (
              <ul>
                {items.map(({ lead, reasons }) => (
                  <li key={lead.id}>
                    <Link to={`/admin/leads/${lead.id}`} onClick={close}>
                      {lead.customerName}
                      <span>{attentionReasonLabel(reasons[0])}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/leads" className="crm-link" onClick={close}>
              View all leads
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
