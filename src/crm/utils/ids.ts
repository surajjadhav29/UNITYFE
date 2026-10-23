export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function formatLeadNumber(counter: number): string {
  return `LEAD-${String(counter).padStart(4, '0')}`;
}
