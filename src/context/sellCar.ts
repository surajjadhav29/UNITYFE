import { createContext } from 'react';

export interface SellCarContextValue {
  openSellModal: () => void;
}

export const SellCarContext = createContext<SellCarContextValue | null>(null);
