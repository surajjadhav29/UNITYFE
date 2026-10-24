import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface DashboardKpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
  to?: string;
}

export function DashboardKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  to,
}: DashboardKpiCardProps) {
  const numericValue = typeof value === 'number' ? value : null;
  const animated = useCountUp(numericValue ?? 0);
  const displayValue = numericValue !== null ? animated : value;

  const inner = (
    <article className="dn-kpi" style={{ '--dn-kpi-accent': accent } as CSSProperties}>
      <div className="dn-kpi-icon" aria-hidden>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="dn-kpi-body">
        <span className="dn-kpi-value">{displayValue}</span>
        <span className="dn-kpi-label">{label}</span>
        {hint ? <span className="dn-kpi-hint">{hint}</span> : null}
      </div>
    </article>
  );

  return to ? (
    <Link to={to} className="dn-kpi-link">
      {inner}
    </Link>
  ) : (
    inner
  );
}
