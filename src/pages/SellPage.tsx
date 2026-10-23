import { ClipboardList, MapPin, PhoneCall } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../data/business';
import { CARS } from '../data/cars';
import styles from './SellPage.module.css';

const STEPS = [
  {
    title: 'Share the car',
    text: 'Tell us the brand, year, kilometres, fuel, and the area in Pune.',
    icon: ClipboardList,
  },
  {
    title: 'Talk it through',
    text: `Call ${BUSINESS.phoneDisplay} or visit Shreehans Nagar during showroom hours.`,
    icon: PhoneCall,
  },
  {
    title: 'Decide the next step',
    text: 'You and the showroom agree what happens next. Nothing is submitted from this website.',
    icon: MapPin,
  },
] as const;

export function SellPage() {
  const [submitted, setSubmitted] = useState(false);
  const brands = [...new Set(CARS.map((car) => car.brand))].sort();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <p className={styles.kicker}>Kondhwa showroom</p>
            <h1>Sell your car with Unity Auto Solution</h1>
            <p className={styles.lead}>
              Share a few details about the car. The Kondhwa team can be
              reached at {BUSINESS.phoneDisplay}, {BUSINESS.hours}.
            </p>
            <ul className={styles.points}>
              <li>The form stays in your browser.</li>
              <li>Showroom address: {BUSINESS.address}.</li>
              <li>Areas named on the listing include {BUSINESS.areas.slice(0, 4).join(', ')}.</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h2>Tell us about the car</h2>
            {submitted ? (
              <p className={styles.success} role="status">
                Saved on this page only. Call {BUSINESS.phoneDisplay} if you
                want the showroom to see the car.
              </p>
            ) : (
              <form className={styles.form} onSubmit={onSubmit}>
                <label>
                  Your name
                  <input name="name" required autoComplete="name" />
                </label>
                <label>
                  Mobile number
                  <input name="phone" required autoComplete="tel" />
                </label>
                <div className={styles.row}>
                  <label>
                    Brand
                    <input name="brand" required placeholder="Hyundai" list="unity-brands" />
                  </label>
                  <label>
                    Year
                    <input name="year" type="number" min={1995} max={2026} required />
                  </label>
                </div>
                <datalist id="unity-brands">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                <div className={styles.row}>
                  <label>
                    Kilometres
                    <input name="km" type="number" min={0} required />
                  </label>
                  <label>
                    Fuel
                    <select name="fuel" defaultValue="Petrol">
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>CNG</option>
                      <option>Electric</option>
                    </select>
                  </label>
                </div>
                <label>
                  Area in Pune
                  <input name="area" defaultValue="Kondhwa" required />
                </label>
                <button type="submit">Save car details</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <p className={styles.sectionKicker}>How a conversation starts</p>
          <h2>Three steps on this site</h2>
          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <article key={step.title}>
                <span>{index + 1}</span>
                <step.icon size={22} aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.muted}`}>
        <div className="container">
          <h2>What the sample listings already show</h2>
          <div className={styles.split}>
            <article>
              <h3>Papers buyers usually ask to see</h3>
              <ul>
                <li>Registration certificate</li>
                <li>Insurance</li>
                <li>Pollution certificate, if it applies</li>
                <li>Both sets of keys, when you have them</li>
              </ul>
            </article>
            <article>
              <h3>Details that change the asking price</h3>
              <ul>
                <li>Year and kilometres</li>
                <li>Fuel and transmission</li>
                <li>Number of previous owners</li>
                <li>The area around Kondhwa you are selling from</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <h2>Brands already in the sample catalogue</h2>
          <div className={styles.chips}>
            {brands.map((brand) => (
              <Link key={brand} to={`/cars?q=${encodeURIComponent(brand)}`}>
                {brand}
              </Link>
            ))}
            {BUSINESS.areas.map((area) => (
              <Link key={area} to={`/cars?q=${encodeURIComponent(area)}`}>
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
