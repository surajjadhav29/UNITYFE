import { STATUS_COLORS } from '../constants';
import type { LeadStatus, VehicleAvailability } from '../types/crm.types';

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className="crm-badge" style={{ background: STATUS_COLORS[status] }}>
      {status}
    </span>
  );
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
