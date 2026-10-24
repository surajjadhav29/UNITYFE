interface LeadIntakeSummaryProps {
  buckets: { label: string; value: number }[];
  totalInRange: number;
  startDate: string;
  endDate: string;
}

function formatRangeLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${s.toLocaleDateString('en-IN', opts)} – ${e.toLocaleDateString('en-IN', opts)}`;
}

export function LeadIntakeSummary({
  buckets,
  totalInRange,
  startDate,
  endDate,
}: LeadIntakeSummaryProps) {
  const max = Math.max(...buckets.map((b) => b.value), 1);
  const dayCount = buckets.length || 1;
  const avgPerDay = dayCount > 0 ? totalInRange / dayCount : 0;
  const best = buckets.reduce(
    (acc, b) => (b.value > acc.value ? b : acc),
    buckets[0] ?? { label: '—', value: 0 },
  );
  return (
    <div className="dn-intake">
      <p className="dn-intake-desc">
        Customer enquiries <strong>first added</strong> between{' '}
        {formatRangeLabel(startDate, endDate)}. Each bar = one{' '}
        {dayCount > 14 ? 'week' : 'day'}.
      </p>

      <div className="dn-intake-stats dn-intake-stats-3">
        <div className="dn-intake-stat">
          <span className="dn-intake-stat-label">Total new enquiries</span>
          <strong className="dn-intake-stat-value">{totalInRange}</strong>
        </div>
        <div className="dn-intake-stat">
          <span className="dn-intake-stat-label">Average per day</span>
          <strong className="dn-intake-stat-value">{avgPerDay.toFixed(1)}</strong>
        </div>
        <div className="dn-intake-stat">
          <span className="dn-intake-stat-label">Busiest {dayCount > 14 ? 'week' : 'day'}</span>
          <strong className="dn-intake-stat-value">{best.value}</strong>
          <span className="dn-intake-stat-hint">{best.label}</span>
        </div>
      </div>

      {buckets.length === 0 ? (
        <p className="dn-empty">No data for this date range.</p>
      ) : (
        <div
          className="dn-intake-bars-wrap"
          role="img"
          aria-label={`New leads chart, maximum ${max} per period`}
        >
          <div className="dn-intake-y-axis">
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
          <div className={`dn-intake-bars${buckets.length > 20 ? ' dn-intake-bars-dense' : ''}`}>
            {buckets.map((b) => (
              <div
                key={b.label}
                className="dn-intake-bar-col"
                title={`${b.label}: ${b.value} new lead${b.value === 1 ? '' : 's'}`}
              >
                {b.value > 0 ? <span className="dn-intake-bar-val">{b.value}</span> : null}
                <div className="dn-intake-bar-track">
                  <div
                    className="dn-intake-bar-fill"
                    style={{ height: `${Math.max(b.value > 0 ? 6 : 0, (b.value / max) * 100)}%` }}
                  />
                </div>
                <span className="dn-intake-bar-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
