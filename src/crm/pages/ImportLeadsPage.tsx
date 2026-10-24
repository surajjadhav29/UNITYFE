import { useState, type ChangeEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { CrmTable } from '../common/components/CrmTable';
import { useCrm } from '../context/CrmContext';
import { canImportLeads } from '../utils/permissions';
import type { LeadSource } from '../types/crm.types';
import { LEAD_SOURCES } from '../constants';

type PreviewRow = {
  customerName: string;
  mobile: string;
  source: LeadSource;
  city?: string;
  budget?: number;
  preferredCar?: string;
};

function parseCsv(text: string): PreviewRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const idx = (names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));

  const nameI = idx(['name', 'customer']);
  const mobileI = idx(['mobile', 'phone']);
  const sourceI = idx(['source']);
  const cityI = idx(['city', 'location']);
  const budgetI = idx(['budget']);
  const carI = idx(['car', 'model', 'preferred']);

  if (nameI < 0 || mobileI < 0) return [];

  const rows: PreviewRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/("([^"]|"")*"|[^,]*)/g)?.map((c) =>
      c.replace(/^"|"$/g, '').replace(/""/g, '"').trim(),
    ) ?? [];
    const customerName = cols[nameI]?.trim();
    const mobile = cols[mobileI]?.replace(/\D/g, '').slice(-10);
    if (!customerName || mobile.length !== 10) continue;
    let source = (cols[sourceI]?.trim() || 'Other') as LeadSource;
    if (!LEAD_SOURCES.includes(source)) source = 'Other';
    const budgetRaw = cols[budgetI]?.replace(/\D/g, '');
    rows.push({
      customerName,
      mobile,
      source,
      city: cols[cityI]?.trim(),
      budget: budgetRaw ? Number(budgetRaw) : undefined,
      preferredCar: cols[carI]?.trim(),
    });
  }
  return rows;
}

export function ImportLeadsPage() {
  const { currentUser, createLead } = useCrm();
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) return null;
  if (!canImportLeads(currentUser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    setError('');
    setMessage('');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ''));
      if (rows.length === 0) {
        setError('Could not read CSV. Need columns: customer name, mobile (optional: source, city, budget).');
        setPreview([]);
        return;
      }
      setPreview(rows);
    };
    reader.readAsText(file);
  }

  function importAll() {
    let ok = 0;
    for (const row of preview) {
      const result = createLead({
        customerName: row.customerName,
        mobile: row.mobile,
        source: row.source,
        city: row.city,
        budget: row.budget,
        preferredCar: row.preferredCar,
        priority: 'Warm',
        assignedStaffId: currentUser!.role === 'admin' ? null : currentUser!.id,
        status: 'New',
      });
      if (result && typeof result === 'object' && 'id' in result) ok++;
    }
    setMessage(`${ok} leads imported as New.`);
    setPreview([]);
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Import leads</h1>
          <p className="crm-page-sub">
            Upload CSV — new rows appear as <strong>New</strong> (stored in this browser)
          </p>
        </div>
      </header>

      <section className="crm-panel crm-import-panel">
        <label className="crm-import-drop">
          <Upload size={28} aria-hidden />
          <span>Choose .csv file (export from Excel as CSV)</span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} hidden />
        </label>
        <p className="crm-import-hint">
          Example header: <code>customerName,mobile,source,city,budget,preferredCar</code>
        </p>
      </section>

      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}
      {message ? <div className="crm-alert crm-alert-success">{message}</div> : null}

      {preview.length > 0 ? (
        <>
          <div className="crm-actions" style={{ marginBottom: '1rem' }}>
            <button type="button" className="crm-btn crm-btn-primary" onClick={importAll}>
              Import {preview.length} leads
            </button>
            <Link to="/admin/leads?status=New%20Lead" className="crm-btn crm-btn-secondary">
              View new leads
            </Link>
          </div>
          <CrmTable stickyHeader>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Source</th>
                  <th>City</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td>{r.customerName}</td>
                    <td>{r.mobile}</td>
                    <td>{r.source}</td>
                    <td>{r.city ?? '—'}</td>
                    <td>{r.budget ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
          </CrmTable>
        </>
      ) : null}
    </>
  );
}
