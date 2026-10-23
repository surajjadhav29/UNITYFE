import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { NeedsAttentionItem } from '../utils/leadInsights';
import { attentionReasonLabel } from '../utils/leadInsights';

interface NeedsAttentionPanelProps {
  items: NeedsAttentionItem[];
  max?: number;
  title?: string;
}

export function NeedsAttentionPanel({
  items,
  max = 8,
  title = 'Needs attention',
}: NeedsAttentionPanelProps) {
  if (items.length === 0) return null;

  const shown = items.slice(0, max);

  return (
    <section className="crm-panel crm-needs-attention">
      <div className="crm-needs-head">
        <AlertTriangle size={20} aria-hidden />
        <h2 className="crm-panel-title" style={{ margin: 0 }}>
          {title}{' '}
          <span className="crm-needs-count">{items.length}</span>
        </h2>
      </div>
      <p className="crm-needs-sub">
        Work these leads first — overdue follow-ups, new enquiries, and stale contacts (dealer CRM
        best practice).
      </p>
      <ul className="crm-needs-list">
        {shown.map(({ lead, reasons }) => (
          <li key={lead.id}>
            <Link to={`/admin/leads/${lead.id}`} className="crm-needs-link">
              <div>
                <strong>{lead.customerName}</strong>
                <span className="crm-needs-meta">
                  {lead.id} · {lead.mobile}
                </span>
                <span className="crm-needs-tags">
                  {reasons.map((r) => (
                    <span key={r} className="crm-needs-tag">
                      {attentionReasonLabel(r)}
                    </span>
                  ))}
                </span>
              </div>
              <ChevronRight size={18} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      {items.length > max ? (
        <p className="crm-needs-more">
          +{items.length - max} more — use <Link to="/admin/leads">Leads</Link> filters
        </p>
      ) : null}
    </section>
  );
}
