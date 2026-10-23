interface LeadSourceChartProps {
  data: { source: string; count: number }[];
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  if (data.length === 0) {
    return <p className="crm-empty">No lead sources yet.</p>;
  }

  return (
    <div className="crm-source-chart">
      {data.map(({ source, count }) => (
        <div key={source} className="crm-source-row">
          <span className="crm-source-label">{source}</span>
          <div className="crm-source-bar-wrap">
            <div
              className="crm-source-bar"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="crm-source-count">
            {count}
            <span className="crm-funnel-pct">
              {' '}
              ({total > 0 ? Math.round((count / total) * 100) : 0}%)
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
