import { Fuel, Gauge, Phone, Settings2, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CarCard } from '../components/AvailableCars/CarCard';
import { BUSINESS } from '../data/business';
import { CARS } from '../data/cars';
import { formatINR, formatKilometres } from '../utils/format';
import styles from './CarDetailsPage.module.css';

function ownerLabel(owners: number): string {
  return owners === 1 ? '1st owner' : `${owners} owners`;
}

export function CarDetailsPage() {
  const { id } = useParams();
  const car = CARS.find((item) => item.id === id);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [view, setView] = useState(0);

  useEffect(() => {
    setView(0);
  }, [id]);

  if (!car) {
    return (
      <section className={styles.missing}>
        <div className="container">
          <h1>Car not found</h1>
          <p>This listing is not in the sample catalogue.</p>
          <p>
            <Link to="/cars">Back to browse</Link>
          </p>
        </div>
      </section>
    );
  }

  const title = `${car.year} ${car.brand} ${car.model}`;
  const views = [
    { src: car.image, label: 'Front' },
    { src: car.image.replace(/\.jpg$/i, '-side.jpg'), label: 'Side' },
    { src: car.image.replace(/\.jpg$/i, '-rear.jpg'), label: 'Rear' },
    { src: car.image.replace(/\.jpg$/i, '-cabin.jpg'), label: 'Interior' },
  ];
  const activeView = views[view] ?? views[0];
  const similar = [
    ...CARS.filter((item) => item.id !== car.id && item.bodyType === car.bodyType),
    ...CARS.filter((item) => item.id !== car.id && item.bodyType !== car.bodyType),
  ].slice(0, 3);

  const highlights = [
    { label: formatKilometres(car.kilometres), icon: Gauge },
    { label: car.fuelType, icon: Fuel },
    { label: car.transmission, icon: Settings2 },
    { label: ownerLabel(car.owners), icon: Users },
  ];

  const specs = [
    ['Year', String(car.year)],
    ['Colour', car.color],
    ['Fuel', car.fuelType],
    ['Transmission', car.transmission],
    ['Kilometres', formatKilometres(car.kilometres)],
    ['Owners', ownerLabel(car.owners)],
    ['Body type', car.bodyType],
    ['Location', car.location],
    ['Brand', car.brand],
    ['Model', car.model],
    ['Asking price', formatINR(car.price)],
  ] as const;

  const questions = [
    {
      q: `What is the asking price of this ${car.model}?`,
      a: `The sample listing shows ${formatINR(car.price)}.`,
    },
    {
      q: 'How many kilometres has it done?',
      a: `The listing shows ${formatKilometres(car.kilometres)}.`,
    },
    {
      q: 'Where can I see the car?',
      a: `The listing is marked ${car.location}. The showroom is at ${BUSINESS.address}, open ${BUSINESS.hours}.`,
    },
    {
      q: 'How do I ask about buying it?',
      a: `Use Buy this car to leave your name and mobile number, or call ${BUSINESS.phoneDisplay}.`,
    },
  ];

  function openForm() {
    setFormOpen(true);
    window.setTimeout(() => {
      document.getElementById('buy-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 40);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError('Enter a 10-digit mobile number.');
      return;
    }
    setError('');
    setSent(true);
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <Link to="/cars" className={styles.back}>
          ← Back to listings
        </Link>

        <div className={styles.top}>
          <div className={styles.main}>
            <div className={styles.image}>
              <img src={activeView.src} alt={`${car.brand} ${car.model}, ${activeView.label}`} />
            </div>

            <div className={styles.thumbs} aria-label="Car views">
              {views.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  className={index === view ? styles.thumbActive : styles.thumb}
                  aria-pressed={index === view}
                  onClick={() => setView(index)}
                >
                  <img src={item.src} alt="" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.titleRow}>
              <div>
                <p className={styles.kicker}>{car.bodyType}</p>
                <h1>{title}</h1>
                <p className={styles.place}>{car.location}</p>
              </div>
              <p className={styles.price}>{formatINR(car.price)}</p>
            </div>

            <ul className={styles.highlights}>
              {highlights.map((item) => (
                <li key={item.label}>
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            <article className={styles.block}>
              <h2>Specifications</h2>
              <dl className={styles.specs}>
                {specs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className={styles.block}>
              <h2>About this car</h2>
              <p>{car.description}</p>
              <p>
                {title} is a {car.color.toLowerCase()} {car.bodyType.toLowerCase()} with{' '}
                {car.fuelType.toLowerCase()} fuel and a {car.transmission.toLowerCase()} gearbox.
                The sample listing shows {ownerLabel(car.owners).toLowerCase()} and{' '}
                {formatKilometres(car.kilometres)}.
              </p>
            </article>

            <article className={styles.block}>
              <h2>Questions about this car</h2>
              <div className={styles.faq}>
                {questions.map((item) => (
                  <details key={item.q}>
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </article>
          </div>

          <aside className={styles.aside}>
            <div className={styles.interest}>
              <p className={styles.interestKicker}>Unity Motors</p>
              <h2>Interested in this car?</h2>
              <p className={styles.interestPrice}>{formatINR(car.price)}</p>
              <p className={styles.interestText}>
                Ask the Kondhwa showroom about the {car.brand} {car.model}.
              </p>
              <button type="button" className={styles.buy} onClick={openForm}>
                Buy this car
              </button>
              <a className={styles.call} href={`tel:${BUSINESS.phoneTel}`}>
                <Phone size={18} aria-hidden="true" />
                Call {BUSINESS.phoneDisplay}
              </a>
              <p className={styles.showroom}>
                {BUSINESS.address}
                <br />
                {BUSINESS.hours}
              </p>

              {formOpen ? (
                <div className={styles.formCard} id="buy-form">
                  {sent ? (
                    <p className={styles.success}>
                      Thanks {name.trim()}. We noted your interest in the {car.brand} {car.model}.
                      Call {BUSINESS.phoneDisplay} to continue.
                    </p>
                  ) : (
                    <form onSubmit={onSubmit}>
                      <p className={styles.formTitle}>Your contact details</p>
                      <label>
                        Name
                        <input
                          name="name"
                          autoComplete="name"
                          required
                          value={name}
                          placeholder="Your name"
                          onChange={(event) => setName(event.target.value)}
                        />
                      </label>
                      <label>
                        Mobile number
                        <input
                          name="mobile"
                          inputMode="numeric"
                          autoComplete="tel"
                          required
                          value={mobile}
                          placeholder="10-digit mobile"
                          onChange={(event) => setMobile(event.target.value)}
                        />
                      </label>
                      <label>
                        Message
                        <textarea
                          name="message"
                          rows={3}
                          value={message}
                          placeholder={`I want to know more about the ${car.brand} ${car.model}`}
                          onChange={(event) => setMessage(event.target.value)}
                        />
                      </label>
                      {error ? <p className={styles.error}>{error}</p> : null}
                      <button type="submit" className={styles.submit}>
                        Send enquiry
                      </button>
                    </form>
                  )}
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <div className={styles.similar}>
          <h2>Other cars you can browse</h2>
          <div className={styles.similarGrid}>
            {similar.map((item) => (
              <CarCard key={item.id} car={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
