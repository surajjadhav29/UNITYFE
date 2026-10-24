import { X } from 'lucide-react';

export function FilterChip({
  fieldLabel,
  valueLabel,
  onRemove,
}: {
  fieldLabel: string;
  valueLabel: string;
  onRemove: () => void;
}) {
  return (
    <span className="ld-active-filter-chip">
      <span className="ld-active-filter-field">{fieldLabel}</span>
      <span className="ld-active-filter-value">{valueLabel}</span>
      <button
        type="button"
        className="ld-active-filter-remove"
        onClick={onRemove}
        aria-label={`Remove ${fieldLabel}: ${valueLabel}`}
      >
        <X size={14} aria-hidden />
      </button>
    </span>
  );
}
