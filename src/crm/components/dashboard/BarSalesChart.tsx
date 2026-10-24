import { formatINR } from '../../../utils/format';

interface BarSalesChartProps {
  bars: { label: string; count: number; revenue: number }[];
  totalSales: number;
  totalRevenue: number;
}

export function BarSalesChart({ bars, totalSales, totalRevenue }: BarSalesChartProps) {
  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="dn-bar-sales">
      <div className="dn-bar-sales-summary">
        <div>
          <span className="dn-muted">Total sales</span>
          <strong>{totalSales}</strong>
        </div>
        <div>
          <span className="dn-muted">Revenue</span>
          <strong>{formatINR(totalRevenue)}</strong>
        </div>
      </div>
      <div className="dn-bars">
        {bars.map((b) => (
          <div key={b.label} className="dn-bar-col">
            <div
              className="dn-bar-fill"
              style={{ height: `${Math.max(8, (b.count / max) * 100)}%` }}
              title={`${b.count} sale(s)`}
            />
            <span className="dn-bar-label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
