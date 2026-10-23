import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SellCarProvider } from '../../context/SellCarContext';
import { CustomerReviews } from '../CustomerReviews/CustomerReviews';
import { Footer } from '../Footer/Footer';
import { Header } from '../Header/Header';
import { SellCarModal } from '../SellCarModal/SellCarModal';
import { WhatsAppButton } from '../WhatsAppButton/WhatsAppButton';
import styles from './Layout.module.css';

export function Layout() {
  const { pathname } = useLocation();
  const [sellOpen, setSellOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const openSellModal = useCallback(() => setSellOpen(true), []);
  const closeSellModal = useCallback(() => setSellOpen(false), []);

  return (
    <SellCarProvider openSellModal={openSellModal}>
      <div className={styles.shell}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
        <CustomerReviews />
        <Footer />
        <WhatsAppButton />
        {sellOpen ? <SellCarModal onClose={closeSellModal} /> : null}
      </div>
    </SellCarProvider>
  );
}
