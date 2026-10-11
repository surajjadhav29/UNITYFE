import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './CustomerReviews.module.css';

const REVIEWS = [
  {
    name: 'Amit',
    place: 'Kondhwa',
    text: 'The team showed the cars at the showroom and explained the asking price clearly.',
  },
  {
    name: 'Neha',
    place: 'NIBM',
    text: 'Easy to visit, and the staff answered my questions on WhatsApp the same day.',
  },
  {
    name: 'Rahul',
    place: 'Undri',
    text: 'I checked a hatchback in person at Shreehans Nagar before I decided.',
  },
  {
    name: 'Sneha',
    place: 'Katraj',
    text: 'The showroom was easy to find and the car I asked about was there to see.',
  },
  {
    name: 'Vikram',
    place: 'Bibwewadi',
    text: 'They walked me through the car and told me the price without a long pitch.',
  },
  {
    name: 'Pooja',
    place: 'Mohammadwadi',
    text: 'I called about a sedan and got a quick reply with the showroom hours.',
  },
  {
    name: 'Imran',
    place: 'Ganga Dham',
    text: 'Straightforward visit. I could look at the car before talking any further.',
  },
  {
    name: 'Kavita',
    place: 'Kondhwa',
    text: 'Helpful on the phone, and the yard had a few cars I could look over.',
  },
] as const;

function useVisibleCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => setCount(query.matches ? 1 : 3);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return count;
}

export function CustomerReviews() {
  const visible = useVisibleCount();
  const maxIndex = Math.max(REVIEWS.length - visible, 0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 4500);
    return () => window.clearInterval(timer);
  }, [maxIndex]);

  function show(next: number) {
    if (next < 0) {
      setIndex(maxIndex);
      return;
    }
    if (next > maxIndex) {
      setIndex(0);
      return;
    }
    setIndex(next);
  }

  const step = 100 / visible;

  return (
    <section className={styles.section} aria-labelledby="reviews-heading">
      <div className="container">
        <p className={styles.kicker}>Showroom visits</p>
        <h2 id="reviews-heading">Customer reviews</h2>
        <p className={styles.lead}>A few notes from people who visited the Kondhwa showroom.</p>

        <div className={styles.slider}>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            aria-label="Previous reviews"
            onClick={() => show(index - 1)}
          >
            <ChevronLeft size={22} />
          </button>

          <div className={styles.viewport} aria-live="polite">
            <div
              className={styles.track}
              style={{ transform: `translateX(-${index * step}%)` }}
            >
              {REVIEWS.map((item) => (
                <article key={`${item.name}-${item.place}`} className={styles.slide}>
                  <div className={styles.card}>
                    <div className={styles.stars} aria-hidden="true">
                      {Array.from({ length: 5 }, (_, star) => (
                        <Star key={star} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <p className={styles.quote}>{item.text}</p>
                    <h3>{item.name}</h3>
                    <span>{item.place}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Next reviews"
            onClick={() => show(index + 1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }, (_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={dotIndex === index ? styles.dotActive : styles.dot}
              aria-label={`Show reviews starting at ${dotIndex + 1}`}
              onClick={() => show(dotIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
