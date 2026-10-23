import { LayoutGrid, Table2 } from 'lucide-react';

export type LeadsViewMode = 'table' | 'card';

const STORAGE_KEY = 'unity-crm-leads-view';

export function loadLeadsViewMode(): LeadsViewMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'card' ? 'card' : 'table';
  } catch {
    return 'table';
  }
}

export function saveLeadsViewMode(mode: LeadsViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

interface LeadsViewToggleProps {
  mode: LeadsViewMode;
  onChange: (mode: LeadsViewMode) => void;
}

export function LeadsViewToggle({ mode, onChange }: LeadsViewToggleProps) {
  return (
    <div className="crm-view-toggle" role="group" aria-label="Leads view">
      <button
        type="button"
        className={`crm-view-toggle-btn${mode === 'table' ? ' active' : ''}`}
        onClick={() => onChange('table')}
        aria-pressed={mode === 'table'}
      >
        <Table2 size={16} aria-hidden />
        Table
      </button>
      <button
        type="button"
        className={`crm-view-toggle-btn${mode === 'card' ? ' active' : ''}`}
        onClick={() => onChange('card')}
        aria-pressed={mode === 'card'}
      >
        <LayoutGrid size={16} aria-hidden />
        Cards
      </button>
    </div>
  );
}
