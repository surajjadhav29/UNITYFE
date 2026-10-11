import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BUSINESS } from '../../data/business';
import styles from './AboutStories.module.css';

const PHOTOS = [
  { src: '/images/google/01.jpg', alt: 'Unity Auto Solution showroom interior' },
  { src: '/images/google/02.jpg', alt: 'Customers with a car at Unity Auto Solution' },
  { src: '/images/google/03.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
  { src: '/images/google/04.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
  { src: '/images/google/05.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
  { src: '/images/google/06.jpg', alt: 'Key handover at Unity Motors' },
  { src: '/images/google/07.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
  { src: '/images/google/08.jpg', alt: 'Customers with a Hyundai at Unity Motors' },
  { src: '/images/google/09.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
  { src: '/images/google/10.jpg', alt: 'Photo from the Unity Auto Solution Google listing' },
] as const;

export function AboutStories() {
  const [active, setActive] = useState<number | null>(null);
  const photo = active === null ? null : PHOTOS[active];

  useEffect(() => {
    if (active === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setActive(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <section className={styles.section} aria-labelledby="photos-heading">
      <div className="container">
        <p className={styles.kicker}>Google listing</p>
        <h2 id="photos-heading">Showroom photos</h2>
        <p className={styles.lead}>
          These are the photos on the public{' '}
          <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer">
            Google listing
          </a>{' '}
          for Unity Auto Solution in Kondhwa. Tap a picture to open it.
        </p>

        <div className={styles.mosaic}>
          {PHOTOS.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={styles.tile}
              onClick={() => setActive(index)}
            >
              <img src={item.src} alt={item.alt} />
            </button>
          ))}
        </div>
      </div>

      {photo ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={photo.alt}>
          <button type="button" className={styles.backdrop} aria-label="Close photo" onClick={() => setActive(null)} />
          <figure className={styles.frame}>
            <img src={photo.src} alt={photo.alt} />
            <button type="button" className={styles.close} aria-label="Close" onClick={() => setActive(null)}>
              <X size={18} />
            </button>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
