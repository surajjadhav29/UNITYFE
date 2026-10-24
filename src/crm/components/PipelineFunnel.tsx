import { Link } from 'react-router-dom';
import { LEAD_STATUSES, STATUS_COLORS } from '../constants';
import type { LeadStatus } from '../types/crm.types';

interface PipelineFunnelProps {
  counts: { status: string; count: number }[];
  total: number;
}

export function PipelineFunnel({ counts, total }: PipelineFunnelProps) {
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="crm-funnel">
      {LEAD_STATUSES.map((status) => {
        const row = counts.find((c) => c.status === status);
        const count = row?.count ?? 0;
        if (count === 0 && !['New', 'Contacted', 'Qualified', 'Negotiation'].includes(status)) {
          return null;
        }
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const width = max > 0 ? Math.max(8, (count / max) * 100) : 0;
        const color = STATUS_COLORS[status as LeadStatus] ?? '#64748b';
        return (
          <Link
            key={status}
            to={`/admin/leads?status=${encodeURIComponent(status)}`}
            className="crm-funnel-row"
          >
            <span className="crm-funnel-label">{status}</span>
            <div className="crm-funnel-bar-wrap">
              <div
                className="crm-funnel-bar"
                style={{ width: `${width}%`, background: color }}
              />
            </div>
            <span className="crm-funnel-count">
              {count} <span className="crm-funnel-pct">({pct}%)</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
