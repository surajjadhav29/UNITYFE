import { FileText, SquarePen, Trash2 } from 'lucide-react';
import type { CrmUser, Lead } from '../../../types/crm.types';
import { canDeleteLeads, canEditLead } from '../../../utils/permissions';
import { cn } from '../../../common/lib/cn';

interface LeadTableRowActionsProps {
  lead: Lead;
  currentUser: CrmUser | null;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadTableRowActions({
  lead,
  currentUser,
  onView,
  onEdit,
  onDelete,
}: LeadTableRowActionsProps) {
  const canEdit = canEditLead(currentUser, lead);
  const canDelete = canDeleteLeads(currentUser);

  return (
    <div className="crm-table-icon-actions">
      <button
        type="button"
        className="crm-table-icon-btn"
        title="View details"
        aria-label={`View ${lead.customerName}`}
        onClick={() => onView(lead)}
      >
        <FileText size={18} strokeWidth={1.6} aria-hidden />
      </button>
      {canEdit ? (
        <button
          type="button"
          className="crm-table-icon-btn"
          title="Edit lead"
          aria-label={`Edit ${lead.customerName}`}
          onClick={() => onEdit(lead)}
        >
          <SquarePen size={17} strokeWidth={1.6} aria-hidden />
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          className={cn('crm-table-icon-btn', 'crm-table-icon-btn--danger')}
          title="Delete lead"
          aria-label={`Delete ${lead.customerName}`}
          onClick={() => onDelete(lead)}
        >
          <Trash2 size={17} strokeWidth={1.6} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
