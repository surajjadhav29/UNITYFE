import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CARS } from '../../data/cars';
import type {
  BudgetRange,
  CarCategoryFilter,
  PriceSort,
} from '../../types/car.types';
import { matchesBudget } from '../../utils/format';
import { CarCard } from './CarCard';
import styles from './AvailableCars.module.css';

const CATEGORIES: CarCategoryFilter[] = [
  'All Cars',
  'Hatchback',
  'Sedan',
  'SUV',
];

interface AvailableCarsProps {
  heading?: string;
  subtitle?: string;
}

function isBudgetRange(value: string | null): value is BudgetRange {
  return (
    value === 'any' ||
    value === 'under-5' ||
    value === '5-10' ||
    value === '10-15' ||
    value === '15-plus'
  );
}

export function AvailableCars({
  heading = 'Explore Available Cars',
  subtitle = 'Sample used cars shown for Kondhwa and nearby Pune areas.',
}: AvailableCarsProps) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const budgetParam = searchParams.get('budget');
  const budget: BudgetRange = isBudgetRange(budgetParam) ? budgetParam : 'any';

  const [category, setCategory] = useState<CarCategoryFilter>('All Cars');
  const [sort, setSort] = useState<PriceSort>('none');

  const cars = useMemo(() => {
    const query = initialQuery.trim().toLowerCase();

    const filtered = CARS.filter((car) => {
      const matchesCategory =
        category === 'All Cars' || car.bodyType === category;
      const matchesQuery =
        query.length === 0 ||
        `${car.brand} ${car.model} ${car.location} ${car.fuelType} ${car.bodyType}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesQuery && matchesBudget(car, budget);
    });

    if (sort === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sort === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }, [budget, category, initialQuery, sort]);

  return (
    <section
      id="available-cars"
      className={styles.section}
      aria-labelledby="cars-heading"
    >
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.kicker}>Listings</p>
            <h2 id="cars-heading">{heading}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.filters} role="group" aria-label="Car category">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.filter} ${
                  category === item ? styles.filterActive : ''
                }`}
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.sortWrap}>
            <label htmlFor="car-sort">Sort</label>
            <select
              id="car-sort"
              className={styles.sort}
              value={sort}
              onChange={(event) => setSort(event.target.value as PriceSort)}
            >
              <option value="none">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {cars.length > 0 ? (
          <div className={styles.grid}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className={styles.empty} role="status">
            <h3>No cars match these filters</h3>
            <p>
              Try another category, budget, or search term to see more owner
              listings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
