import type { Booking, StockVehicle } from '../types/crm.types';

export function activeBookingForVehicle(
  vehicleId: string,
  bookings: Booking[],
): Booking | undefined {
  return bookings.find(
    (b) =>
      b.vehicleId === vehicleId &&
      (b.status === 'Booked' || b.status === 'Booking Pending' || b.status === 'Sold/Delivered'),
  );
}

export function canReserveVehicle(
  vehicle: StockVehicle,
  bookings: Booking[],
): { ok: true } | { ok: false; reason: string } {
  if (vehicle.availability === 'Sold') {
    return { ok: false, reason: 'This vehicle is already sold.' };
  }
  const active = activeBookingForVehicle(vehicle.id, bookings);
  if (active && active.status !== 'Cancelled') {
    return { ok: false, reason: `Vehicle has an active booking (${active.status}).` };
  }
  if (vehicle.availability === 'Reserved') {
    return { ok: false, reason: 'Vehicle is reserved for another customer.' };
  }
  return { ok: true };
}
