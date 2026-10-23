import { useState, type FormEvent } from 'react';
import { BUSINESS } from '../data/business';
import styles from './ContactPage.module.css';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div>
          <h1>Contact Us</h1>
          <p className={styles.lead}>
            These details come from the public Google listing for Unity Auto
            Solution. The form on this page stays in the browser.
          </p>
          <div className={styles.card}>
            <p>
              Phone:{' '}
              <a href={`tel:${BUSINESS.phoneTel}`}>{BUSINESS.phoneDisplay}</a>
            </p>
            <p>{BUSINESS.address}</p>
            <p>Hours: {BUSINESS.hours}</p>
            <p>{BUSINESS.hoursNote}</p>
            <p>
              <a href={BUSINESS.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </p>
          </div>
        </div>

        {submitted ? (
          <p className={styles.success} role="status">
            Message captured locally. No email was sent from this frontend-only
            site.
          </p>
        ) : (
          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className={styles.field}>
              <span>Message</span>
              <textarea name="message" rows={5} required />
            </label>
            <button type="submit" className={styles.submit}>
              Send message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
