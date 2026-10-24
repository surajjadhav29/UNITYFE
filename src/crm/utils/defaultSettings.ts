import { BUSINESS } from '../../data/business';
import { DEFAULT_LEAD_SOURCES, DEFAULT_LEAD_STATUSES } from '../constants';
import type { CrmSettings } from '../types/crm.types';

export function createDefaultSettings(): CrmSettings {
  return {
    dealershipName: BUSINESS.name,
    dealershipPhone: BUSINESS.phoneDisplay,
    dealershipAddress: BUSINESS.address,
    leadSources: [...DEFAULT_LEAD_SOURCES],
    leadStatuses: [...DEFAULT_LEAD_STATUSES],
    stockAgingDaysThreshold: 45,
    defaultFollowUpDays: 2,
  };
}
