import { Link } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import styles from './Footer.module.css';

const COPYRIGHT_YEAR = 2026;

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM17.2 7.4a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9Z"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <Link to="/" className={styles.brand} aria-label="Unity Auto Solutions">
              <img src="/images/unity-logo.png" alt="" />
            </Link>
            <p className={styles.blurb}>
              Used-car dealer in Kondhwa, Pune. Browse sample listings and use
              the public showroom contact details to ask about a car.
            </p>
            <div className={styles.social}>
              <a
                href={BUSINESS.instagram}
                aria-label="Unity Auto Solutions on Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <h2 className={styles.heading}>Company</h2>
            <nav className={styles.links} aria-label="Footer">
              <Link to="/buy">Buy a Car</Link>
              <Link to="/sell">Sell Your Car</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
            </nav>
          </div>

          <div>
            <h2 className={styles.heading}>Explore</h2>
            <nav className={styles.links} aria-label="Explore">
              <Link to="/cars">Used cars</Link>
              <Link to="/cars?q=Kondhwa">Kondhwa</Link>
              <Link to="/cars?q=NIBM">NIBM</Link>
              <Link to="/cars?q=Katraj">Katraj</Link>
            </nav>
          </div>

          <div className={styles.contact}>
            <h2 className={styles.heading}>Get in touch</h2>
            <p>
              <a href={`tel:${BUSINESS.phoneTel}`}>{BUSINESS.phoneDisplay}</a>
            </p>
            <p>{BUSINESS.address}</p>
            <p>{BUSINESS.hours}</p>
            <p>
              <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer">
                Google Maps
              </a>
            </p>
          </div>
        </div>
        <p className={styles.copy}>
          © {COPYRIGHT_YEAR} {BUSINESS.legalName}. Showroom details are taken
          from the public Google listing.
        </p>
      </div>
    </footer>
  );
}
