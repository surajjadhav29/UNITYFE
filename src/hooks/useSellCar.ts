import { useContext } from 'react';
import { SellCarContext } from '../context/sellCar';

export function useSellCar() {
  const value = useContext(SellCarContext);
  if (!value) {
    throw new Error('useSellCar must be used within SellCarProvider');
  }
  return value;
}
