import { Fuel, Gauge, MapPin, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Car } from '../../types/car.types';
import { formatINR, formatKilometres } from '../../utils/format';
import styles from './CarCard.module.css';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={car.image} alt={`${car.brand} ${car.model}`} />
        <p className={styles.priceTag}>{formatINR(car.price)}</p>
      </div>
      <div className={styles.body}>
        <div>
          <h3 className={styles.title}>
            {car.brand} {car.model}
          </h3>
          <p className={styles.meta}>
            <span>{car.year}</span>
            <span>
              <Gauge size={14} aria-hidden="true" />
              {formatKilometres(car.kilometres)}
            </span>
            <span>
              <Fuel size={14} aria-hidden="true" />
              {car.fuelType}
            </span>
            <span>
              <Settings2 size={14} aria-hidden="true" />
              {car.transmission}
            </span>
          </p>
        </div>
        <div className={styles.priceRow}>
          <p className={styles.price}>{formatINR(car.price)}</p>
          <p className={styles.location}>
            <MapPin size={13} aria-hidden="true" /> {car.location}
          </p>
        </div>
        <Link className={styles.details} to={`/cars/${car.id}`}>
          View Details
        </Link>
      </div>
    </article>
  );
}
