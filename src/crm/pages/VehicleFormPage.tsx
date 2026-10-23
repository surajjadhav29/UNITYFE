import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import type { FuelType, Transmission, VehicleAvailability } from '../types/crm.types';

const AVAIL: VehicleAvailability[] = ['Available', 'Reserved', 'Sold', 'Inactive'];
const FUELS: FuelType[] = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANS: Transmission[] = ['Manual', 'Automatic'];

export function VehicleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { state, createVehicle, updateVehicle, currentUser } = useCrm();

  const existing = id ? state.vehicles.find((v) => v.id === id) : undefined;
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    registrationNumber: existing?.registrationNumber ?? '',
    brand: existing?.brand ?? '',
    model: existing?.model ?? '',
    variant: existing?.variant ?? '',
    year: existing?.year?.toString() ?? '',
    kilometres: existing?.kilometres?.toString() ?? '',
    fuelType: (existing?.fuelType ?? 'Petrol') as FuelType,
    transmission: (existing?.transmission ?? 'Manual') as Transmission,
    color: existing?.color ?? '',
    purchasePrice: existing?.purchasePrice?.toString() ?? '',
    sellingPrice: existing?.sellingPrice?.toString() ?? '',
    image: existing?.image ?? '/images/cars/swift.jpg',
    description: existing?.description ?? '',
    availability: (existing?.availability ?? 'Available') as VehicleAvailability,
    showOnWebsite: existing?.showOnWebsite ?? true,
  });

  if (!currentUser) return null;
  if (isEdit && !existing) return <Navigate to="/admin/vehicles" replace />;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.brand.trim() || !form.model.trim() || !form.sellingPrice) {
      setError('Brand, model, and selling price are required.');
      return;
    }
    const payload = {
      registrationNumber: form.registrationNumber.trim() || undefined,
      brand: form.brand.trim(),
      model: form.model.trim(),
      variant: form.variant.trim() || undefined,
      year: Number(form.year),
      kilometres: Number(form.kilometres),
      fuelType: form.fuelType,
      transmission: form.transmission,
      color: form.color.trim() || '—',
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
      sellingPrice: Number(form.sellingPrice),
      image: form.image.trim(),
      description: form.description.trim(),
      availability: form.availability,
      showOnWebsite: form.showOnWebsite,
    };

    if (isEdit && id) {
      updateVehicle(id, payload);
      navigate('/admin/vehicles');
      return;
    }
    createVehicle(payload);
    navigate('/admin/vehicles');
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h1>
          <p className="crm-page-sub">
            <Link to="/admin/vehicles" className="crm-link">
              ← Stock list
            </Link>
          </p>
        </div>
      </header>
      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}
      <form className="crm-panel crm-form" onSubmit={onSubmit}>
        <div className="crm-form-grid">
          <div className="crm-field">
            <label>Registration no.</label>
            <input
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Availability</label>
            <select
              value={form.availability}
              onChange={(e) =>
                setForm({ ...form, availability: e.target.value as VehicleAvailability })
              }
            >
              {AVAIL.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Brand *</label>
            <input
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Model *</label>
            <input
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Variant</label>
            <input
              value={form.variant}
              onChange={(e) => setForm({ ...form, variant: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Year *</label>
            <input
              type="number"
              required
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Kilometres *</label>
            <input
              type="number"
              required
              value={form.kilometres}
              onChange={(e) => setForm({ ...form, kilometres: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Fuel</label>
            <select
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}
            >
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
              onChange={(e) =>
                setForm({ ...form, transmission: e.target.value as Transmission })
              }
            >
              {TRANS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="crm-field">
            <label>Color</label>
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div className="crm-field">
            <label>Purchase price</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>Selling price *</label>
            <input
              type="number"
              required
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            />
          </div>
          <div className="crm-field span2">
            <label>Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="crm-field span2">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="crm-field">
            <label>
              <input
                type="checkbox"
                checked={form.showOnWebsite}
                onChange={(e) => setForm({ ...form, showOnWebsite: e.target.checked })}
              />{' '}
              Show on public website
            </label>
          </div>
        </div>
        <button type="submit" className="crm-btn crm-btn-primary">
          {isEdit ? 'Save vehicle' : 'Add to stock'}
        </button>
      </form>
    </>
  );
}
