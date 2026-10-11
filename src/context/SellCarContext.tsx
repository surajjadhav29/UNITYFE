import type { ReactNode } from 'react';
import { SellCarContext } from './sellCar';

export function SellCarProvider({
  children,
  openSellModal,
}: {
  children: ReactNode;
  openSellModal: () => void;
}) {
  return (
    <SellCarContext.Provider value={{ openSellModal }}>
      {children}
    </SellCarContext.Provider>
  );
}
