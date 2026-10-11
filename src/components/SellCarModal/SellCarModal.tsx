import { X } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import styles from './SellCarModal.module.css';

interface SellCarModalProps {
  onClose: () => void;
}

export function SellCarModal({ onClose }: SellCarModalProps) {
  const titleId = useId();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.top}>
          <div>
            <h2 id={titleId}>List Your Car</h2>
            <p>
              Share a few details. This form stays on the frontend and does not
              send data anywhere.
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close listing form"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <p className={styles.success} role="status">
            Thanks. Your listing preview has been captured locally. A live
            listing would appear here once a backend is added.
          </p>
        ) : (
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Your name</span>
                <input name="name" required autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>Phone</span>
                <input name="phone" required autoComplete="tel" />
              </label>
            </div>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Brand</span>
                <input name="brand" required placeholder="Hyundai" />
              </label>
              <label className={styles.field}>
                <span>Model</span>
                <input name="model" required placeholder="Creta" />
              </label>
            </div>
            <div className={styles.row}>
              <label className={styles.field}>
                <span>Year</span>
                <input name="year" type="number" min={1995} max={2026} required />
              </label>
              <label className={styles.field}>
                <span>Asking price (₹)</span>
                <input name="price" type="number" min={1} required />
              </label>
            </div>
            <label className={styles.field}>
              <span>City / area</span>
              <input name="location" defaultValue="Pune" required />
            </label>
            <label className={styles.field}>
              <span>Notes</span>
              <textarea
                name="notes"
                rows={3}
                placeholder="Kilometres, fuel, extras"
              />
            </label>
            <button type="submit" className={styles.submit}>
              Submit listing preview
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
