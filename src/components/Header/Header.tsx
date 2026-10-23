import { Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BUSINESS } from '../../data/business';
import styles from './Header.module.css';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy a Car' },
  { to: '/sell', label: 'Sell Your Car' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink
          to="/"
          className={styles.brand}
          onClick={closeMenu}
          aria-label="Unity Auto Solutions"
        >
          <img
            className={styles.logo}
            src="/images/unity-logo.png"
            alt="Unity Auto Solutions"
          />
        </NavLink>

        <nav className={styles.nav} aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
          <a className={styles.cta} href={`tel:${BUSINESS.phoneTel}`}>
            <Phone size={16} aria-hidden="true" />
            {BUSINESS.phoneDisplay}
          </a>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className={styles.mobilePanel} aria-label="Mobile">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              end={link.to === '/'}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
          <a className={styles.cta} href={`tel:${BUSINESS.phoneTel}`} onClick={closeMenu}>
            <Phone size={16} aria-hidden="true" />
            {BUSINESS.phoneDisplay}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
