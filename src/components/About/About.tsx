import { ClipboardList, Handshake, UserRound } from 'lucide-react';
import { CarEnquiry } from '../CarEnquiry/CarEnquiry';
import styles from './About.module.css';

const BENEFITS = [
  {
    title: 'Kondhwa showroom',
    text: 'The public listing places the dealer at Shreehans Nagar, Kondhwa.',
    icon: UserRound,
  },
  {
    title: 'Transparent car details',
    text: 'See year, kilometres, fuel, transmission, and asking price up front.',
    icon: ClipboardList,
  },
  {
    title: 'Easy buyer connections',
    text: 'Call the listed number or send a note from the contact page.',
    icon: Handshake,
  },
] as const;

export function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.kicker}>About Unity</p>
          <h2 id="about-heading">A Better Way to Buy and Sell Used Cars</h2>
          <p className={styles.description}>
            Unity Auto Solution is a used-car dealer in Kondhwa, Pune. This
            site shows the public showroom details and sample cars so buyers
            can compare year, kilometres, fuel, and asking price before they
            call or visit.
          </p>
          <div className={styles.cards}>
            {BENEFITS.map((item) => (
              <article key={item.title} className={styles.card}>
                <span className={styles.icon} aria-hidden="true">
                  <item.icon size={16} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <CarEnquiry compact />
      </div>
    </section>
  );
}
