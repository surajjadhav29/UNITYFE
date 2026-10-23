import { CarFront, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './HeroBanner.module.css';

const SLIDES = [
  {
    src: '/images/unity-motors-yard.png',
    alt: 'Unity Motors showroom entrance in Kondhwa with cars parked in the yard',
  },
  {
    src: '/images/listing-1.jpg',
    alt: 'Seating area inside the Unity Motors showroom',
  },
] as const;

export function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  function show(next: number) {
    const total = SLIDES.length;
    setIndex((next + total) % total);
  }

  return (
    <section className={styles.section} aria-labelledby="hero-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Unity Motors · Kondhwa, Pune</p>
          <h1 id="hero-heading">
            Buy and sell used cars
            <span> the Unity Motors way</span>
          </h1>
          <p className={styles.subtitle}>
            Visit the Shreehans Nagar showroom, look through the sample cars,
            or tell the team about a car you want to sell.
          </p>
          <div className={styles.actions}>
            <Link className={styles.buy} to="/buy">
              <CarFront size={22} aria-hidden="true" />
              Buy Car
            </Link>
            <Link className={styles.sell} to="/sell">
              <KeyRound size={22} aria-hidden="true" />
              Sell Car
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.frame}>
            {SLIDES.map((slide, slideIndex) => (
              <img
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                className={slideIndex === index ? styles.slideActive : styles.slide}
              />
            ))}
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              aria-label="Previous showroom photo"
              onClick={() => show(index - 1)}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              aria-label="Next showroom photo"
              onClick={() => show(index + 1)}
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className={styles.dots} role="tablist" aria-label="Showroom photos">
            {SLIDES.map((slide, slideIndex) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Show photo ${slideIndex + 1}`}
                className={slideIndex === index ? styles.dotActive : styles.dot}
                onClick={() => show(slideIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
