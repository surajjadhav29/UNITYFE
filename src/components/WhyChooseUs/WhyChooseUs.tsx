import { IndianRupee, MapPin, MessagesSquare, Search } from 'lucide-react';
import styles from './WhyChooseUs.module.css';

const ITEMS = [
  {
    title: 'Easy car discovery',
    text: 'Filter hatchbacks, sedans, and SUVs, then sort by asking price.',
    icon: Search,
  },
  {
    title: 'Kondhwa showroom',
    text: 'Unity Auto Solution is listed at Shreehans Nagar, Kondhwa, Pune 411037.',
    icon: MapPin,
  },
  {
    title: 'Clear pricing',
    text: 'Sample listings show the asking price in rupees, with year, kilometres, and fuel.',
    icon: IndianRupee,
  },
  {
    title: 'Talk to the team',
    text: 'Call 088888 85076 or visit during the listed showroom hours.',
    icon: MessagesSquare,
  },
] as const;

export function WhyChooseUs() {
  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className="container">
        <p className={styles.kicker}>Why Unity Auto Solution</p>
        <h2 id="why-heading" className={styles.heading}>
          Why Choose Unity Auto Solution in Kondhwa
        </h2>
        <div className={styles.grid}>
          {ITEMS.map((item) => (
            <article key={item.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                <item.icon size={22} />
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
