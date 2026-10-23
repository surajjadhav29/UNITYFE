import { IndianRupee, MapPin, Phone, Star } from 'lucide-react';
import styles from './TrustSection.module.css';

const ITEMS = [
  {
    title: 'Kondhwa showroom',
    text: 'See cars at Shreehans Nagar before you decide.',
    icon: MapPin,
  },
  {
    title: 'Prices on the card',
    text: 'Each sample listing shows the asking price in rupees.',
    icon: IndianRupee,
  },
  {
    title: 'A simple next step',
    text: 'Call or WhatsApp the showroom number on this site.',
    icon: Phone,
  },
  {
    title: 'Google reviews',
    text: 'The public listing shows 5.0 from 16 reviews.',
    icon: Star,
  },
] as const;

export function TrustSection() {
  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className="container">
        <p className={styles.kicker}>Why Unity Motors</p>
        <h2 id="trust-heading">Clear details from the showroom</h2>
        <div className={styles.grid}>
          {ITEMS.map((item) => (
            <article key={item.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                <item.icon size={18} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
