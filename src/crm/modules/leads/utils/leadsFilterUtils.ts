export type LeadsSheetFilters = {
  sources: string[];
  statuses: string[];
  priorities: string[];
  staffIds: string[];
};

export const EMPTY_LEADS_FILTERS: LeadsSheetFilters = {
  sources: [],
  statuses: [],
  priorities: [],
  staffIds: [],
};

export const LEAD_PRIORITY_OPTIONS = ['Hot', 'Warm', 'Cold'] as const;

export type LeadsFilterChip = {
  id: string;
  kind: keyof LeadsSheetFilters;
  value: string;
  fieldLabel: string;
  valueLabel: string;
};

export function countActiveLeadFilters(f: LeadsSheetFilters): number {
  return f.sources.length + f.statuses.length + f.priorities.length + f.staffIds.length;
}

export function toggleFilterValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function buildLeadFilterChips(
  filters: LeadsSheetFilters,
  getStaffName: (id: string) => string,
): LeadsFilterChip[] {
  const chips: LeadsFilterChip[] = [];
  for (const value of filters.sources) {
    chips.push({
      id: `sources:${value}`,
      kind: 'sources',
      value,
      fieldLabel: 'Source',
      valueLabel: value,
    });
  }
  for (const value of filters.statuses) {
    chips.push({
      id: `statuses:${value}`,
      kind: 'statuses',
      value,
      fieldLabel: 'Status',
      valueLabel: value,
    });
  }
  for (const value of filters.priorities) {
    chips.push({
      id: `priorities:${value}`,
      kind: 'priorities',
      value,
      fieldLabel: 'Priority',
      valueLabel: value,
    });
  }
  for (const id of filters.staffIds) {
    chips.push({
      id: `staffIds:${id}`,
      kind: 'staffIds',
      value: id,
      fieldLabel: 'Assigned to',
      valueLabel: getStaffName(id),
    });
  }
  return chips;
}

export function removeLeadFilterChip(
  filters: LeadsSheetFilters,
  chip: Pick<LeadsFilterChip, 'kind' | 'value'>,
): LeadsSheetFilters {
  return {
    ...filters,
    [chip.kind]: filters[chip.kind].filter((v) => v !== chip.value),
  };
}
