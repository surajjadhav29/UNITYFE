import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface KpiItem {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

export function LeadsKpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="ld-kpi-strip">
      {items.map(({ label, value, icon: Icon, accent }) => (
        <div key={label} className="ld-kpi-mini" style={{ '--ld-accent': accent } as CSSProperties}>
          <span className="ld-kpi-mini-icon">
            <Icon size={16} />
          </span>
          <div>
            <span className="ld-kpi-mini-label">{label}</span>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
