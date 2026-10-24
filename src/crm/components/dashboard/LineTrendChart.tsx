interface LineTrendChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function LineTrendChart({ data, height = 160 }: LineTrendChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const pad = 8;
  const innerH = height - pad * 2;

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
    const y = pad + innerH - (d.value / max) * innerH;
    return `${x},${y}`;
  });

  const areaPoints = `${pad},${height - pad} ${points.join(' ')} ${width - pad},${height - pad}`;

  return (
    <div className="dn-line-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="dn-line-svg"
        role="img"
        aria-label="Lead trend line chart"
      >
        <defs>
          <linearGradient id="dnLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#dnLineFill)" />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
          const y = pad + innerH - (d.value / max) * innerH;
          return <circle key={d.label} cx={x} cy={y} r="2.5" fill="#2563eb" />;
        })}
      </svg>
      <div className="dn-line-labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
