import type { BudgetRange, Car } from '../types/car.types';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKilometres(km: number): string {
  return `${new Intl.NumberFormat('en-IN').format(km)} km`;
}

export function matchesBudget(car: Car, budget: BudgetRange): boolean {
  switch (budget) {
    case 'under-5':
      return car.price < 500000;
    case '5-10':
      return car.price >= 500000 && car.price < 1000000;
    case '10-15':
      return car.price >= 1000000 && car.price < 1500000;
    case '15-plus':
      return car.price >= 1500000;
    default:
      return true;
  }
}
