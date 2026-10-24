import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCrm } from '../../../context/CrmContext';
import { LEAD_SOURCES } from '../../../constants';
import type { Lead, LeadSource } from '../../../types/crm.types';
import { formatLeadBudget, interestedVehicleLabel } from '../../../utils/leadFormat';
import { canEditLead } from '../../../utils/permissions';
import { LeadSourceBadge } from './LeadSourceBadge';
import { LeadStatusBadge } from '../../../components/StatusBadge';
import { PriorityBadge } from '../../../components/PriorityBadge';

export type LeadQuickModalMode = 'view' | 'edit';

interface LeadQuickModalProps {
  lead: Lead | null;
  open: boolean;
  mode: LeadQuickModalMode;
  onClose: () => void;
  onModeChange: (mode: LeadQuickModalMode) => void;
}

export function LeadQuickModal({
  lead,
  open,
  mode,
  onClose,
  onModeChange,
}: LeadQuickModalProps) {
  const { state, currentUser, updateLead, getUserById } = useCrm();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    email: '',
    city: '',
    whatsapp: '',
    alternateContact: '',
    preferredCar: '',
    budget: '',
    remarks: '',
    source: 'Website' as LeadSource,
  });

  const editable = lead ? canEditLead(currentUser, lead) : false;

  useEffect(() => {
    if (!lead) return;
    setForm({
      customerName: lead.customerName,
      mobile: lead.mobile,
      email: lead.email ?? '',
      city: lead.city ?? '',
      whatsapp: lead.whatsapp ?? '',
      alternateContact: lead.alternateContact ?? '',
      preferredCar: lead.preferredCar ?? '',
      budget: lead.budget?.toString() ?? '',
      remarks: lead.remarks ?? '',
      source: lead.source,
    });
    setError('');
  }, [lead, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const vehicleLabel = useMemo(() => {
    if (!lead) return '—';
    return interestedVehicleLabel(lead, (id) => {
      const v = state.vehicles.find((x) => x.id === id);
      return v ? `${v.brand} ${v.model}` : undefined;
    });
  }, [lead, state.vehicles]);

  if (!open || !lead) return null;

  function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editable) return;
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    const result = updateLead(lead!.id, {
      customerName: form.customerName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      city: form.city.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      alternateContact: form.alternateContact.trim() || undefined,
      preferredCar: form.preferredCar.trim() || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      remarks: form.remarks.trim() || undefined,
      source: form.source,
    });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onModeChange('view');
  }

  const assigned = getUserById(lead.assignedStaffId)?.name ?? 'Unassigned';

  const sectionTitle =
    'mb-2 text-xs font-bold uppercase tracking-wide text-slate-500';
  const dlGrid = 'grid grid-cols-2 gap-x-4 gap-y-2.5';
  const dtClass = 'text-xs font-semibold text-slate-400';
  const ddClass = 'mt-0.5 text-sm font-medium text-slate-800';

  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-0 bg-slate-900/45"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[min(88vh,820px)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ld-lead-modal-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-4">
          <div>
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-wide text-slate-500">
              {lead.id}
            </p>
            <h2 id="ld-lead-modal-title" className="mt-1 text-lg font-bold text-slate-900">
              {lead.customerName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <LeadSourceBadge source={lead.source} />
              <LeadStatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        {mode === 'view' ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <section className="mb-4">
              <h3 className={sectionTitle}>Contact</h3>
              <dl className={dlGrid}>
                <div>
                  <dt className={dtClass}>Mobile</dt>
                  <dd className={ddClass}>{lead.mobile}</dd>
                </div>
                <div>
                  <dt className={dtClass}>WhatsApp</dt>
                  <dd className={ddClass}>{lead.whatsapp ?? '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Alternate</dt>
                  <dd className={ddClass}>{lead.alternateContact ?? '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Email</dt>
                  <dd className={ddClass}>{lead.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>City</dt>
                  <dd className={ddClass}>{lead.city ?? '—'}</dd>
                </div>
              </dl>
            </section>
            <section className="mb-4">
              <h3 className={sectionTitle}>Requirement</h3>
              <dl className={dlGrid}>
                <div>
                  <dt className={dtClass}>Interested vehicle</dt>
                  <dd className={ddClass}>{vehicleLabel}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Budget</dt>
                  <dd className={ddClass}>{formatLeadBudget(lead)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Preferred car (text)</dt>
                  <dd className={ddClass}>{lead.preferredCar ?? '—'}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Year / fuel / transmission</dt>
                  <dd className={ddClass}>
                    {[lead.preferredYear, lead.fuelType, lead.transmission]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className={dtClass}>Purchase timeline</dt>
                  <dd className={ddClass}>{lead.purchaseTimeline ?? '—'}</dd>
                </div>
              </dl>
            </section>
            <section className="mb-4">
              <h3 className={sectionTitle}>CRM</h3>
              <dl className={dlGrid}>
                <div>
                  <dt className={dtClass}>Assigned to</dt>
                  <dd className={ddClass}>{assigned}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Next follow-up</dt>
                  <dd className={ddClass}>
                    {lead.nextFollowUpAt
                      ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN')
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className={dtClass}>Created</dt>
                  <dd className={ddClass}>{new Date(lead.createdAt).toLocaleString('en-IN')}</dd>
                </div>
                <div>
                  <dt className={dtClass}>Last updated</dt>
                  <dd className={ddClass}>{new Date(lead.updatedAt).toLocaleString('en-IN')}</dd>
                </div>
              </dl>
            </section>
            {lead.remarks ? (
              <section className="mb-4">
                <h3 className={sectionTitle}>Remarks</h3>
                <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {lead.remarks}
                </p>
              </section>
            ) : null}
          </div>
        ) : (
          <form className="flex flex-1 flex-col overflow-hidden" onSubmit={saveEdit}>
            {error ? <p className="crm-alert crm-alert-error">{error}</p> : null}
            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-5 py-4">
              <label className="ld-field">
                Customer name
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                Mobile
                <input
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                />
              </label>
              <label className="ld-field">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                City
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                WhatsApp
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                Alternate contact
                <input
                  value={form.alternateContact}
                  onChange={(e) => setForm((f) => ({ ...f, alternateContact: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                Source
                <select
                  value={form.source}
                  onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as LeadSource }))}
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ld-field">
                Preferred car
                <input
                  value={form.preferredCar}
                  onChange={(e) => setForm((f) => ({ ...f, preferredCar: e.target.value }))}
                />
              </label>
              <label className="ld-field">
                Budget (₹)
                <input
                  inputMode="numeric"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value.replace(/\D/g, '') }))}
                />
              </label>
              <label className="ld-field col-span-2">
                Remarks
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                />
              </label>
            </div>
            <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button type="button" className="crm-btn crm-btn-secondary" onClick={() => onModeChange('view')}>
                Cancel
              </button>
              <button type="submit" className="crm-btn crm-btn-primary">
                Save changes
              </button>
            </footer>
          </form>
        )}

        {mode === 'view' ? (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <Link to={`/admin/leads/${lead.id}`} className="crm-btn crm-btn-ghost">
              Open full page
            </Link>
            {editable ? (
              <button
                type="button"
                className="crm-btn crm-btn-primary"
                onClick={() => onModeChange('edit')}
              >
                Edit details
              </button>
            ) : null}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
