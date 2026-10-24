import { FilterChip } from '../../../common/components';
import type { LeadsFilterChip } from '../utils/leadsFilterUtils';

export function LeadsActiveFiltersRow({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: LeadsFilterChip[];
  onRemove: (chip: LeadsFilterChip) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="ld-active-filters" aria-label="Applied filters">
      {chips.map((chip) => (
        <FilterChip
          key={chip.id}
          fieldLabel={chip.fieldLabel}
          valueLabel={chip.valueLabel}
          onRemove={() => onRemove(chip)}
        />
      ))}
      <button type="button" className="ld-active-filters-clear" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
