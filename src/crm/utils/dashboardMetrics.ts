import { isToday } from './followUpDue';

export type DashboardRange = 'today' | '7d' | 'month' | 'all';

const MS_DAY = 86400000;

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return null;
    return 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function inDashboardRange(
  iso: string,
  range: DashboardRange,
  now = new Date(),
): boolean {
  const d = new Date(iso);
  if (range === 'all') return true;
  if (range === 'today') return isToday(iso, now);
  if (range === '7d') return now.getTime() - d.getTime() <= 7 * MS_DAY;
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/** Previous period of equal length for trend comparison. */
export function inPreviousDashboardRange(
  iso: string,
  range: DashboardRange,
  now = new Date(),
): boolean {
  const d = new Date(iso);
  if (range === 'all') return false;
  if (range === 'today') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return isToday(iso, y);
  }
  if (range === '7d') {
    const t = now.getTime() - d.getTime();
    return t > 7 * MS_DAY && t <= 14 * MS_DAY;
  }
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return (
    d.getMonth() === prevMonth.getMonth() &&
    d.getFullYear() === prevMonth.getFullYear()
  );
}

export function lastNDaysBuckets(
  days: number,
  countForDay: (dayStart: Date) => number,
  now = new Date(),
): { label: string; value: number }[] {
  const buckets: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    buckets.push({
      label: day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: countForDay(day),
    });
  }
  return buckets;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function leadCreatedOnDay(iso: string, dayStart: Date): boolean {
  const d = new Date(iso);
  const end = new Date(dayStart);
  end.setDate(end.getDate() + 1);
  return d >= dayStart && d < end;
}

export function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function defaultDashboardDateRange(): { start: string; end: string } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  return { start: formatDateInput(start), end: formatDateInput(end) };
}

export function parseDateInput(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function inDateRange(iso: string, startYmd: string, endYmd: string): boolean {
  const d = new Date(iso);
  const start = parseDateInput(startYmd);
  const end = endOfDay(parseDateInput(endYmd));
  return d >= start && d <= end;
}

/** Equal-length period immediately before [start, end]. */
export function inPreviousDateRange(iso: string, startYmd: string, endYmd: string): boolean {
  const start = parseDateInput(startYmd);
  const end = parseDateInput(endYmd);
  const spanDays = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / MS_DAY) + 1,
  );
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (spanDays - 1));
  prevStart.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  return d >= prevStart && d <= prevEnd;
}

export function trendBucketsForRange(
  startYmd: string,
  endYmd: string,
  countForDay: (dayStart: Date) => number,
): { label: string; value: number }[] {
  const start = parseDateInput(startYmd);
  const end = parseDateInput(endYmd);
  if (end < start) return [];

  const dayCount =
    Math.floor((end.getTime() - start.getTime()) / MS_DAY) + 1;

  if (dayCount <= 31) {
    const buckets: { label: string; value: number }[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dayStart = new Date(cur);
      dayStart.setHours(0, 0, 0, 0);
      buckets.push({
        label: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        value: countForDay(dayStart),
      });
      cur.setDate(cur.getDate() + 1);
    }
    return buckets;
  }

  const buckets: { label: string; value: number }[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const weekStart = new Date(cur);
    let weekTotal = 0;
    for (let i = 0; i < 7 && cur <= end; i++) {
      const dayStart = new Date(cur);
      dayStart.setHours(0, 0, 0, 0);
      weekTotal += countForDay(dayStart);
      cur.setDate(cur.getDate() + 1);
    }
    buckets.push({
      label: weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: weekTotal,
    });
  }
  return buckets;
}
