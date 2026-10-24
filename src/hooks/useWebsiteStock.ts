import { useSyncExternalStore } from 'react';
import { CARS } from '../data/cars';
import type { Car } from '../types/car.types';
import { CRM_STORAGE_KEY } from '../crm/constants';
import { normalizeLoadedState } from '../crm/utils/migrateState';

function readCarsFromCrm(): Car[] | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) return null;
    const state = normalizeLoadedState(JSON.parse(raw) as unknown);
    const mapped = state.vehicles
      .filter(
        (v) =>
          v.showOnWebsite &&
          v.availability !== 'Sold' &&
          v.availability !== 'Inactive',
      )
      .map(
        (v): Car => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          kilometres: v.kilometres,
          fuelType: v.fuelType as Car['fuelType'],
          transmission: v.transmission,
          price: v.sellingPrice,
          location: v.registrationCity ?? 'Pune',
          bodyType: 'Sedan',
          image: v.image,
          color: v.color,
          owners: v.previousOwners ?? 1,
          description: v.description,
        }),
      );
    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener('unity-crm-update', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('unity-crm-update', handler);
  };
}

function getSnapshot(): Car[] {
  return readCarsFromCrm() ?? CARS;
}

export function useWebsiteStock(): Car[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => CARS);
}
