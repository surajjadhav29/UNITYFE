import {
  CarFront,
  Fuel,
  IndianRupee,
  Phone,
  Search,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarCard } from '../components/AvailableCars/CarCard';
import { BUSINESS } from '../data/business';
import { CARS } from '../data/cars';
import type { BodyType, FuelType } from '../types/car.types';
import styles from './BuyPage.module.css';

const BODY_TYPES: BodyType[] = ['Hatchback', 'Sedan', 'SUV'];

export function BuyPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const car of CARS) {
      counts.set(car.brand, (counts.get(car.brand) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const fuels = useMemo(() => {
    return [...new Set(CARS.map((car) => car.fuelType))];
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    const search = params.toString();
    navigate(search ? `/cars?${search}` : '/cars');
  }

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.kicker}>
            {CARS.length} sample cars around Kondhwa
          </p>
          <h1>Buy a used car in Kondhwa</h1>
          <p className={styles.lead}>
            Look through Unity Auto Solution sample listings by brand, body
            style, fuel, and budget. Ask the Kondhwa showroom about a car on{' '}
            {BUSINESS.phoneDisplay}.
          </p>
          <form className={styles.search} onSubmit={onSearch}>
            <label className="sr-only" htmlFor="buy-query">
              Search brand, model, or area
            </label>
            <Search size={18} aria-hidden="true" />
            <input
              id="buy-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Swift, Creta, Kondhwa, or NIBM"
            />
            <button type="submit">Search listings</button>
          </form>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <p className={styles.sectionKicker}>From the sample catalogue</p>
          <h2>Brands in the current listings</h2>
          <div className={styles.brandGrid}>
            <Link to="/cars" className={styles.brandCard}>
              <CarFront size={22} aria-hidden="true" />
              <strong>All cars</strong>
              <span>{CARS.length} listings</span>
            </Link>
            {brands.map(([brand, count]) => (
              <Link
                key={brand}
                to={`/cars?q=${encodeURIComponent(brand)}`}
                className={styles.brandCard}
              >
                <strong>{brand}</strong>
                <span>
                  {count} {count === 1 ? 'car' : 'cars'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.muted}`}>
        <div className="container">
          <p className={styles.sectionKicker}>Body styles we list</p>
          <h2>Choose a body style</h2>
          <div className={styles.styleGrid}>
            {BODY_TYPES.map((type) => {
              const count = CARS.filter((car) => car.bodyType === type).length;
              return (
                <Link key={type} to={`/cars?q=${type}`} className={styles.styleCard}>
                  <strong>{type}</strong>
                  <span>{count} in the sample set</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <p className={styles.sectionKicker}>At the Kondhwa showroom</p>
          <h2>Why look at cars with Unity</h2>
          <div className={styles.reasons}>
            <article>
              <Search size={20} aria-hidden="true" />
              <h3>Details on every card</h3>
              <p>Year, kilometres, fuel, transmission, and asking price are on the listing.</p>
            </article>
            <article>
              <Phone size={20} aria-hidden="true" />
              <h3>Call before you visit</h3>
              <p>
                {BUSINESS.phoneDisplay}. Showroom hours on the listing are {BUSINESS.hours}.
              </p>
            </article>
            <article>
              <Fuel size={20} aria-hidden="true" />
              <h3>Petrol and diesel samples</h3>
              <p>The current sample set includes {fuels.join(' and ')} cars.</p>
            </article>
            <article>
              <IndianRupee size={20} aria-hidden="true" />
              <h3>Budgets you can filter</h3>
              <p>Under ₹5 lakh, ₹5–10 lakh, ₹10–15 lakh, and above ₹15 lakh.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.muted}`}>
        <div className="container">
          <h2>A few cars from the sample set</h2>
          <div className={styles.cars}>
            {CARS.slice(0, 3).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          <div className={styles.filters}>
            <div>
              <h3>Browse by budget</h3>
              <div className={styles.chips}>
                <Link to="/cars?budget=under-5">Under ₹5 lakh</Link>
                <Link to="/cars?budget=5-10">₹5–10 lakh</Link>
                <Link to="/cars?budget=10-15">₹10–15 lakh</Link>
                <Link to="/cars?budget=15-plus">₹15 lakh and above</Link>
              </div>
            </div>
            <div>
              <h3>Browse by fuel</h3>
              <div className={styles.chips}>
                {fuels.map((fuel) => (
                  <Link key={fuel} to={`/cars?q=${fuel}`}>
                    {fuel as FuelType}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
