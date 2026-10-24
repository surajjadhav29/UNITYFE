import type { Lead } from '../types/crm.types';
import { formatINR } from '../../utils/format';

export function formatLeadBudget(lead: Lead): string {
  const max = lead.budgetMax ?? lead.budget;
  const min = lead.budgetMin;
  if (min && max && min !== max) {
    return `${formatINR(min)} – ${formatINR(max)}`;
  }
  if (max) return formatINR(max);
  return '—';
}

export function interestedVehicleLabel(
  lead: Lead,
  getModel: (vehicleId: string) => string | undefined,
): string {
  if (lead.preferredCar?.trim()) return lead.preferredCar;
  if (lead.interestedVehicleId) {
    return getModel(lead.interestedVehicleId) ?? '—';
  }
  return '—';
}
