import { Link } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import styles from './LocalInfo.module.css';

const SERVICES = [
  { label: 'Browse used cars', to: '/cars' },
  { label: 'Sell your car', to: '/sell' },
  { label: 'About the showroom', to: '/about' },
  { label: 'Contact Kondhwa', to: '/contact' },
] as const;

export function LocalInfo() {
  return (
    <section className={styles.section} aria-labelledby="local-heading">
      <div className="container">
        <div className={styles.top}>
          <div>
            <h2 id="local-heading">More ways to look around Pune</h2>
            <div className={styles.chips}>
              {SERVICES.map((item) => (
                <Link key={item.label} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2>Areas named on the listing</h2>
            <div className={styles.chips}>
              {BUSINESS.areas.map((area) => (
                <Link key={area} to={`/cars?q=${encodeURIComponent(area)}`}>
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h2>Talk to us about cars in Kondhwa</h2>
            <p>
              Unity Auto Solution is a used-car dealer on Google at Shreehans
              Nagar. The public listing shows {BUSINESS.rating} from{' '}
              {BUSINESS.reviewCount} reviews.
            </p>
            <ul>
              <li>
                <a href={`tel:${BUSINESS.phoneTel}`}>{BUSINESS.phoneDisplay}</a>
              </li>
              <li>{BUSINESS.address}</li>
              <li>{BUSINESS.hours}</li>
              <li>
                <a href={BUSINESS.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
            <Link className={styles.browse} to="/cars">
              Browse Cars
            </Link>
          </article>

          <div className={styles.mapWrap}>
            <p className={styles.mapLabel}>
              Shreehans Nagar, Kondhwa, Pune, Maharashtra
            </p>
            <iframe
              title="Map of Unity Auto Solution in Kondhwa, Pune"
              src={BUSINESS.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
