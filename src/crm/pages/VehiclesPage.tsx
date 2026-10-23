import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { canManageStock } from '../utils/permissions';
import { VehicleStatusBadge } from '../components/StatusBadge';
import { formatINR, formatKilometres } from '../../utils/format';
import type { VehicleAvailability } from '../types/crm.types';
import { countLeadsForVehicle, stockDaysListed } from '../utils/leadInsights';

export function VehiclesPage() {
  const { state, updateVehicle, currentUser } = useCrm();
  const canEdit = canManageStock(currentUser);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.vehicles.filter((v) => {
      if (availability && v.availability !== availability) return false;
      if (!q) return true;
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        (v.registrationNumber?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [state.vehicles, search, availability]);

  function toggleWebsite(id: string, show: boolean) {
    updateVehicle(id, { showOnWebsite: show });
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Stock</h1>
          <p className="crm-page-sub">Vehicle listings for showroom & website sync (demo)</p>
        </div>
        <div className="crm-actions">
          {canEdit ? (
            <Link to="/admin/vehicles/new" className="crm-btn crm-btn-primary">
              <Plus size={16} aria-hidden />
              Add vehicle
            </Link>
          ) : null}
        </div>
      </header>

      <div className="crm-filters">
        <input
          placeholder="Search brand, model, reg no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value as VehicleAvailability | '')}
        >
          <option value="">All availability</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Year / KM</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Days on lot</th>
              <th>Leads linked</th>
              <th>Website</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <img
                      src={v.image}
                      alt=""
                      width={56}
                      height={40}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <div>
                      <strong>
                        {v.brand} {v.model}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--crm-muted)' }}>
                        {v.registrationNumber ?? v.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {v.year} · {formatKilometres(v.kilometres)}
                </td>
                <td>{formatINR(v.sellingPrice)}</td>
                <td>
                  <VehicleStatusBadge status={v.availability} />
                </td>
                <td>
                  <span className={stockDaysListed(v) > 45 ? 'crm-text-warn' : undefined}>
                    {stockDaysListed(v)}d
                  </span>
                </td>
                <td>{countLeadsForVehicle(v.id, state.leads)}</td>
                <td>
                  <label style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={v.showOnWebsite}
                      onChange={(e) => toggleWebsite(v.id, e.target.checked)}
                    />
                    Show
                  </label>
                </td>
                <td>
                  <Link to={`/admin/vehicles/${v.id}/edit`} className="crm-link">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="crm-empty">No vehicles found.</p> : null}
      </div>
    </>
  );
}
