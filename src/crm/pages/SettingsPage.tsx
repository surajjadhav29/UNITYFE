import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { CrmPageHeader } from '../components/CrmPageHeader';
import { useCrm } from '../context/CrmContext';
import { DEFAULT_LEAD_SOURCES, DEFAULT_LEAD_STATUSES } from '../constants';
import { canManageSettings } from '../utils/permissions';

export function SettingsPage() {
  const { state, updateSettings, currentUser } = useCrm();
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState({ ...state.settings });

  if (!canManageSettings(currentUser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved('');
    const result = updateSettings(form);
    if (!result.ok) {
      setSaved(result.error);
      return;
    }
    setSaved('Settings saved.');
  }

  function resetLists() {
    setForm((f) => ({
      ...f,
      leadSources: [...DEFAULT_LEAD_SOURCES],
      leadStatuses: [...DEFAULT_LEAD_STATUSES],
    }));
  }

  return (
    <div className="crm-page">
      <CrmPageHeader
        title="Settings"
        description="Dealership profile, lead sources, and operational defaults."
        breadcrumbs={['CRM', 'Settings']}
      />

      {saved ? (
        <div className={`crm-alert${saved.includes('Settings') ? '' : ' crm-alert-error'}`}>
          {saved}
        </div>
      ) : null}

      <form className="crm-panel crm-form-grid" onSubmit={onSubmit}>
        <h2 className="crm-panel-title">Dealership profile</h2>
        <label className="crm-field crm-span-2">
          Display name
          <input
            required
            value={form.dealershipName}
            onChange={(e) => setForm((f) => ({ ...f, dealershipName: e.target.value }))}
          />
        </label>
        <label className="crm-field">
          Phone
          <input
            value={form.dealershipPhone}
            onChange={(e) => setForm((f) => ({ ...f, dealershipPhone: e.target.value }))}
          />
        </label>
        <label className="crm-field crm-span-2">
          Address
          <textarea
            rows={2}
            value={form.dealershipAddress}
            onChange={(e) => setForm((f) => ({ ...f, dealershipAddress: e.target.value }))}
          />
        </label>

        <h2 className="crm-panel-title crm-span-2">Operations</h2>
        <label className="crm-field">
          Stock aging alert (days)
          <input
            type="number"
            min={1}
            value={form.stockAgingDaysThreshold}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                stockAgingDaysThreshold: Number(e.target.value),
              }))
            }
          />
        </label>
        <label className="crm-field">
          Default follow-up offset (days)
          <input
            type="number"
            min={0}
            value={form.defaultFollowUpDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultFollowUpDays: Number(e.target.value) }))
            }
          />
        </label>

        <div className="crm-span-2">
          <p className="crm-muted-text">
            Lead sources and statuses are stored in your browser data layer until a backend is
            connected. Marketplace integrations (OLX, Cars24) are manual source labels only.
          </p>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn-sm" onClick={resetLists}>
            Reset source & status lists to defaults
          </button>
        </div>

        <div className="crm-form-actions crm-span-2">
          <button type="submit" className="crm-btn crm-btn-primary">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
