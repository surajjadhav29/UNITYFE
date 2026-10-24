import { useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LOST_REASONS,
} from '../constants';
import type {
  FuelType,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LostReason,
  PurchaseTimeline,
  Transmission,
} from '../types/crm.types';
import {
  canCreateLead,
  canEditLead,
  canManageUsers,
  filterAssignableStaff,
} from '../utils/permissions';

const PRIORITIES: LeadPriority[] = ['Hot', 'Warm', 'Cold'];
const TIMELINES: PurchaseTimeline[] = [
  'Immediately',
  'Within 7 days',
  'Within 30 days',
  'Later',
  'Undecided',
];
const FUELS: FuelType[] = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANS: Transmission[] = ['Manual', 'Automatic'];

export function LeadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const {
    state,
    currentUser,
    createLead,
    updateLead,
    findDuplicateMobile,
    getUserById,
  } = useCrm();

  const existing = useMemo(
    () => (id ? state.leads.find((l) => l.id === id) : undefined),
    [id, state.leads],
  );

  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const [form, setForm] = useState(() => ({
    customerName: existing?.customerName ?? '',
    mobile: existing?.mobile ?? '',
    alternateContact: existing?.alternateContact ?? '',
    whatsapp: existing?.whatsapp ?? '',
    email: existing?.email ?? '',
    city: existing?.city ?? '',
    source: (existing?.source ?? 'Website') as LeadSource,
    preferredCar: existing?.preferredCar ?? '',
    budget: existing?.budget?.toString() ?? '',
    preferredYear: existing?.preferredYear ?? '',
    fuelType: existing?.fuelType ?? '',
    transmission: existing?.transmission ?? '',
    purchaseTimeline: existing?.purchaseTimeline ?? '',
    priority: (existing?.priority ?? 'Warm') as LeadPriority,
    assignedStaffId: existing?.assignedStaffId ?? currentUser?.id ?? '',
    status: (existing?.status ?? 'New') as LeadStatus,
    lostReason: existing?.lostReason ?? '',
    lostNotes: existing?.lostNotes ?? '',
    remarks: existing?.remarks ?? '',
    interestedVehicleId: existing?.interestedVehicleId ?? '',
  }));

  if (!currentUser) return null;
  if (!isEdit && !canCreateLead(currentUser)) {
    return <Navigate to="/admin/leads" replace />;
  }
  if (isEdit && !existing) {
    return <Navigate to="/admin/leads" replace />;
  }
  if (isEdit && existing && !canEditLead(currentUser, existing)) {
    return <Navigate to="/admin/leads" replace />;
  }

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === 'mobile') {
      const dup = findDuplicateMobile(String(value), id);
      setDuplicateWarning(dup ? `Possible duplicate: ${dup.id} (${dup.customerName})` : '');
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    const payload = {
      customerName: form.customerName.trim(),
      mobile: form.mobile.trim(),
      alternateContact: form.alternateContact.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      email: form.email.trim() || undefined,
      city: form.city.trim() || undefined,
      source: form.source,
      preferredCar: form.preferredCar.trim() || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      preferredYear: form.preferredYear.trim() || undefined,
      fuelType: (form.fuelType as FuelType) || undefined,
      transmission: (form.transmission as Transmission) || undefined,
      purchaseTimeline: (form.purchaseTimeline as PurchaseTimeline) || undefined,
      priority: form.priority,
      assignedStaffId: form.assignedStaffId || null,
      status: form.status,
      lostReason: (form.lostReason as LostReason) || undefined,
      lostNotes: form.lostNotes.trim() || undefined,
      remarks: form.remarks.trim() || undefined,
      interestedVehicleId: form.interestedVehicleId || undefined,
    };

    if (isEdit && id) {
      const result = updateLead(id, payload);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      navigate(`/admin/leads/${id}`);
      return;
    }

    const result = createLead(payload);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    navigate(`/admin/leads/${result.id}`);
  }

  const staffOptions = filterAssignableStaff(state.users);

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">{isEdit ? `Edit ${id}` : 'New lead'}</h1>
          <p className="crm-page-sub">
            <Link to={isEdit ? `/admin/leads/${id}` : '/admin/leads'} className="crm-link">
              ← Back
            </Link>
          </p>
        </div>
      </header>

      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}
      {duplicateWarning ? (
        <div className="crm-alert crm-alert-warning">{duplicateWarning}</div>
      ) : null}

      <form className="crm-panel crm-form" onSubmit={onSubmit}>
        <div className="crm-form-grid">
          <div className="crm-field">
            <label>Customer name *</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => patch('customerName', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>Mobile *</label>
            <input
              required
              inputMode="numeric"
              value={form.mobile}
              onChange={(e) => patch('mobile', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>Alternate contact</label>
            <input
              value={form.alternateContact}
              onChange={(e) => patch('alternateContact', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => patch('whatsapp', e.target.value)} />
          </div>
          <div className="crm-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => patch('email', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>City / location</label>
            <input value={form.city} onChange={(e) => patch('city', e.target.value)} />
          </div>
          <div className="crm-field">
            <label>Lead source *</label>
            <select
              required
              value={form.source}
              onChange={(e) => patch('source', e.target.value as LeadSource)}
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Status *</label>
            <select
              value={form.status}
              onChange={(e) => patch('status', e.target.value as LeadStatus)}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {form.status === 'Lost' ? (
            <>
              <div className="crm-field">
                <label>Lost reason *</label>
                <select
                  required
                  value={form.lostReason}
                  onChange={(e) => patch('lostReason', e.target.value)}
                >
                  <option value="">Select…</option>
                  {LOST_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-field span2">
                <label>Lost notes</label>
                <textarea
                  value={form.lostNotes}
                  onChange={(e) => patch('lostNotes', e.target.value)}
                />
              </div>
            </>
          ) : null}
          <div className="crm-field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => patch('priority', e.target.value as LeadPriority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {canManageUsers(currentUser) ? (
            <div className="crm-field">
              <label>Assigned staff</label>
              <select
                value={form.assignedStaffId}
                onChange={(e) => patch('assignedStaffId', e.target.value)}
              >
                <option value="">Unassigned</option>
                {staffOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="crm-field">
              <label>Assigned staff</label>
              <input
                disabled
                value={getUserById(form.assignedStaffId)?.name ?? 'You'}
              />
            </div>
          )}
          <div className="crm-field">
            <label>Preferred car</label>
            <input
              value={form.preferredCar}
              onChange={(e) => patch('preferredCar', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>Budget (INR)</label>
            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => patch('budget', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>Preferred year</label>
            <input
              placeholder="e.g. 2019-2021"
              value={form.preferredYear}
              onChange={(e) => patch('preferredYear', e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label>Fuel type</label>
            <select value={form.fuelType} onChange={(e) => patch('fuelType', e.target.value)}>
              <option value="">—</option>
              {FUELS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Transmission</label>
            <select
              value={form.transmission}
              onChange={(e) => patch('transmission', e.target.value)}
            >
              <option value="">—</option>
              {TRANS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Purchase timeline</label>
            <select
              value={form.purchaseTimeline}
              onChange={(e) => patch('purchaseTimeline', e.target.value)}
            >
              <option value="">—</option>
              {TIMELINES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Interested vehicle (stock)</label>
            <select
              value={form.interestedVehicleId}
              onChange={(e) => patch('interestedVehicleId', e.target.value)}
            >
              <option value="">—</option>
              {state.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.year})
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field span2">
            <label>Remarks</label>
            <textarea value={form.remarks} onChange={(e) => patch('remarks', e.target.value)} />
          </div>
        </div>
        <div className="crm-actions">
          <button type="submit" className="crm-btn crm-btn-primary">
            {isEdit ? 'Save changes' : 'Create lead'}
          </button>
        </div>
      </form>
    </>
  );
}
