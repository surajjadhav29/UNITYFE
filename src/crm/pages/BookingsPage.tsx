import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { CrmPageHeader } from '../components/CrmPageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { CrmTable, crmTableActionsClass } from '../common/components/CrmTable';
import { useCrm } from '../context/CrmContext';
import { canManageBookings, filterAssignableStaff } from '../utils/permissions';
import { formatINR } from '../../utils/format';
import type { BookingStatus } from '../types/crm.types';

export function BookingsPage() {
  const {
    visibleBookings,
    visibleLeads,
    state,
    getUserById,
    createBooking,
    updateBooking,
    currentUser,
  } = useCrm();
  const canManage = canManageBookings(currentUser);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    leadId: '',
    vehicleId: '',
    agreedPrice: '',
    tokenAmount: '',
    bookingDate: new Date().toISOString().slice(0, 10),
    paymentMode: 'UPI',
    assignedStaffId: currentUser?.id ?? '',
    status: 'Booked' as BookingStatus,
    notes: '',
  });

  const staffOptions = filterAssignableStaff(state.users);

  const rows = useMemo(
    () =>
      [...visibleBookings].sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      ),
    [visibleBookings],
  );

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    const price = Number(form.agreedPrice.replace(/\D/g, ''));
    if (!form.leadId || !form.vehicleId || !price) {
      setMessage('Lead, vehicle, and agreed price are required.');
      return;
    }
    const token = form.tokenAmount ? Number(form.tokenAmount.replace(/\D/g, '')) : undefined;
    const result = createBooking({
      leadId: form.leadId,
      vehicleId: form.vehicleId,
      agreedPrice: price,
      tokenAmount: token,
      bookingDate: new Date(form.bookingDate).toISOString(),
      paymentMode: form.paymentMode,
      assignedStaffId: form.assignedStaffId || currentUser!.id,
      notes: form.notes,
      status: form.status,
      remainingAmount: token ? Math.max(0, price - token) : price,
      paymentStatus: token ? 'Partial' : 'Pending',
    });
    if ('error' in result) {
      setMessage(result.error);
      return;
    }
    setShowForm(false);
    setMessage('Booking saved. Vehicle reserved and lead updated.');
  }

  return (
    <div className="crm-page">
      <CrmPageHeader
        title="Bookings & sales"
        description="Connect qualified leads to stock and track token to delivery."
        breadcrumbs={['CRM', 'Bookings']}
        actions={
          canManage ? (
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} aria-hidden />
              New booking
            </button>
          ) : null
        }
      />

      {message ? <div className="crm-alert">{message}</div> : null}

      {showForm && canManage ? (
        <form className="crm-panel crm-form-grid" onSubmit={onSubmit}>
          <h2 className="crm-panel-title">Record booking</h2>
          <label className="crm-field">
            Lead
            <select
              required
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
            >
              <option value="">Select lead</option>
              {visibleLeads
                .filter((l) => !['Won', 'Lost'].includes(l.status))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.customerName} · {l.status}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            Vehicle
            <select
              required
              value={form.vehicleId}
              onChange={(e) => {
                const v = state.vehicles.find((x) => x.id === e.target.value);
                setForm((f) => ({
                  ...f,
                  vehicleId: e.target.value,
                  agreedPrice: v ? String(v.sellingPrice) : f.agreedPrice,
                }));
              }}
            >
              <option value="">Select vehicle</option>
              {state.vehicles
                .filter((v) => v.availability === 'Available')
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} · {formatINR(v.sellingPrice)}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            Agreed price (₹)
            <input
              required
              inputMode="numeric"
              value={form.agreedPrice}
              onChange={(e) => setForm((f) => ({ ...f, agreedPrice: e.target.value }))}
            />
          </label>
          <label className="crm-field">
            Token amount (₹)
            <input
              inputMode="numeric"
              value={form.tokenAmount}
              onChange={(e) => setForm((f) => ({ ...f, tokenAmount: e.target.value }))}
            />
          </label>
          <label className="crm-field">
            Booking date
            <input
              type="date"
              required
              value={form.bookingDate}
              onChange={(e) => setForm((f) => ({ ...f, bookingDate: e.target.value }))}
            />
          </label>
          <label className="crm-field">
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BookingStatus }))}
            >
              <option value="Booking Pending">Booking Pending</option>
              <option value="Booked">Booked</option>
              <option value="Sold/Delivered">Sold/Delivered</option>
            </select>
          </label>
          <label className="crm-field">
            Payment mode
            <input
              value={form.paymentMode}
              onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))}
            />
          </label>
          <label className="crm-field">
            Sales executive
            <select
              value={form.assignedStaffId}
              onChange={(e) => setForm((f) => ({ ...f, assignedStaffId: e.target.value }))}
            >
              {staffOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field crm-span-2">
            Notes
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>
          <div className="crm-form-actions crm-span-2">
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="crm-btn crm-btn-primary">
              Save booking
            </button>
          </div>
        </form>
      ) : null}

      <CrmTable stickyHeader>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Price</th>
              <th>Token</th>
              <th>Status</th>
              <th>Executive</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="crm-empty-cell">
                  No bookings yet. Create one when a customer is ready to reserve a vehicle.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const lead = state.leads.find((l) => l.id === b.leadId);
                const vehicle = state.vehicles.find((v) => v.id === b.vehicleId);
                return (
                  <tr key={b.id}>
                    <td>{new Date(b.bookingDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      {lead ? (
                        <Link to={`/admin/leads/${lead.id}`}>{lead.customerName}</Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {vehicle ? (
                        <Link to={`/admin/vehicles/${vehicle.id}/edit`}>
                          {vehicle.brand} {vehicle.model}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{formatINR(b.agreedPrice)}</td>
                    <td>{b.tokenAmount ? formatINR(b.tokenAmount) : '—'}</td>
                    <td>
                      <StatusBadge
                        label={b.status}
                        tone={
                          b.status === 'Sold/Delivered'
                            ? 'ok'
                            : b.status === 'Cancelled'
                              ? 'danger'
                              : 'neutral'
                        }
                      />
                    </td>
                    <td>{getUserById(b.assignedStaffId)?.name ?? '—'}</td>
                    <td className={crmTableActionsClass}>
                      {canManage && b.status === 'Booked' ? (
                        <>
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost crm-btn-sm"
                            onClick={() =>
                              updateBooking(b.id, { status: 'Sold/Delivered' })
                            }
                          >
                            Mark delivered
                          </button>
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost crm-btn-sm"
                            onClick={() => updateBooking(b.id, { status: 'Cancelled' })}
                          >
                            Cancel
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
      </CrmTable>
    </div>
  );
}
