import { STATUS_COLORS } from '../constants';
import type { LeadStatus, VehicleAvailability } from '../types/crm.types';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className="crm-badge" style={{ background: STATUS_COLORS[status] }}>
      {status}
    </span>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'ok' | 'warn' | 'neutral' | 'danger';
}) {
  const cls =
    tone === 'ok'
      ? 'crm-badge-success'
      : tone === 'warn'
        ? 'crm-badge-warning'
        : tone === 'danger'
          ? 'crm-badge-danger'
          : 'crm-badge-muted';
  return <span className={`crm-badge ${cls}`}>{label}</span>;
}

export function VehicleStatusBadge({ status }: { status: VehicleAvailability }) {
  const map: Record<VehicleAvailability, string> = {
    Available: 'crm-badge-success',
    Reserved: 'crm-badge-warning',
    Sold: 'crm-badge-muted',
    Inactive: 'crm-badge-danger',
  };
  return <span className={`crm-badge ${map[status]}`}>{status}</span>;
}
