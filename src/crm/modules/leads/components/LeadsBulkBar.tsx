import { Trash2, UserRound, X } from 'lucide-react';
import type { CrmUser } from '../../../types/crm.types';

interface LeadsBulkBarProps {
  selectedCount: number;
  staffOptions: CrmUser[];
  staffId: string;
  onStaffChange: (staffId: string) => void;
  onAssign: () => void;
  onDelete?: () => void;
  onClear: () => void;
  canDelete: boolean;
}

export function LeadsBulkBar({
  selectedCount,
  staffOptions,
  staffId,
  onStaffChange,
  onAssign,
  onDelete,
  onClear,
  canDelete,
}: LeadsBulkBarProps) {
  const selectedStaff = staffOptions.find((u) => u.id === staffId);
  const canAssign = Boolean(staffId);

  return (
    <div className="ld-bulk-bar-pro" role="region" aria-label="Bulk lead actions">
      <div className="ld-bulk-bar-pro-left">
        <span className="ld-bulk-count-badge" aria-live="polite">
          <strong>{selectedCount}</strong>
          <span>{selectedCount === 1 ? 'lead selected' : 'leads selected'}</span>
        </span>
      </div>

      <div className="ld-bulk-bar-pro-actions">
        <div className="ld-bulk-assign-group">
          <label className="ld-bulk-field-label" htmlFor="ld-bulk-assign-select">
            Assign to
          </label>
          <select
            id="ld-bulk-assign-select"
            className="ld-bulk-select"
            value={staffId}
            onChange={(e) => onStaffChange(e.target.value)}
          >
            <option value="">Choose staff…</option>
            {staffOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ld-bulk-btn ld-bulk-btn-primary"
            disabled={!canAssign}
            title={
              canAssign
                ? `Assign ${selectedCount} lead(s) to ${selectedStaff?.name ?? 'staff'}`
                : 'Select a staff member first'
            }
            onClick={onAssign}
          >
            <UserRound size={16} strokeWidth={1.75} aria-hidden />
            Assign
            {canAssign && selectedStaff ? (
              <span className="ld-bulk-btn-meta">→ {selectedStaff.name.split(' ')[0]}</span>
            ) : null}
          </button>
        </div>

        {canDelete && onDelete ? (
          <button
            type="button"
            className="ld-bulk-btn ld-bulk-btn-danger"
            title={`Delete ${selectedCount} selected lead(s)`}
            onClick={onDelete}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            Delete {selectedCount}
          </button>
        ) : null}

        <button
          type="button"
          className="ld-bulk-btn ld-bulk-btn-ghost"
          title="Clear selection"
          onClick={onClear}
        >
          <X size={16} strokeWidth={1.75} aria-hidden />
          Clear
        </button>
      </div>
    </div>
  );
}
