interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  segments,
  size = 168,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const filtered = segments.filter((s) => s.value > 0);
  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="dn-donut-empty">
        <p>No data yet</p>
      </div>
    );
  }

  return (
    <div className="dn-donut-wrap dn-donut-row">
      <div className="dn-donut-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
        {filtered.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={14}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {(centerLabel || centerValue !== undefined) && (
        <div className="dn-donut-center">
          {centerValue !== undefined ? (
            <strong>{centerValue}</strong>
          ) : null}
          {centerLabel ? <span>{centerLabel}</span> : null}
        </div>
      )}
      </div>
      <ul className="dn-donut-legend">
        {filtered.map((seg) => (
          <li key={seg.label}>
            <span className="dn-dot" style={{ background: seg.color }} />
            <span className="dn-legend-label">{seg.label}</span>
            <span className="dn-legend-pct">
              {seg.value} ({Math.round((seg.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
