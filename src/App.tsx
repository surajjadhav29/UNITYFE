import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { AboutPage } from './pages/AboutPage';
import { BrowsePage } from './pages/BrowsePage';
import { CarDetailsPage } from './pages/CarDetailsPage';
import { ContactPage } from './pages/ContactPage';
import { BuyPage } from './pages/BuyPage';
import { HomePage } from './pages/HomePage';
import { SellPage } from './pages/SellPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="buy" element={<BuyPage />} />
          <Route path="sell" element={<SellPage />} />
          <Route path="cars" element={<BrowsePage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
