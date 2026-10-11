import { useState, type FormEvent } from 'react';
import styles from './CarEnquiry.module.css';

const BUDGETS = [
  { value: '300000', label: '₹3 Lakh' },
  { value: '500000', label: '₹5 Lakh' },
  { value: '700000', label: '₹7 Lakh' },
  { value: '1000000', label: '₹10 Lakh' },
  { value: '1500000', label: '₹15 Lakh' },
  { value: '2000000', label: '₹20 Lakh' },
] as const;

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

interface EnquiryState {
  name: string;
  mobile: string;
  minBudget: string;
  maxBudget: string;
  minYear: string;
  maxYear: string;
  model: string;
}

const EMPTY: EnquiryState = {
  name: '',
  mobile: '',
  minBudget: '',
  maxBudget: '',
  minYear: '',
  maxYear: '',
  model: '',
};

interface CarEnquiryProps {
  compact?: boolean;
}

export function CarEnquiry({ compact = false }: CarEnquiryProps) {
  const [form, setForm] = useState<EnquiryState>(EMPTY);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<EnquiryState | null>(null);

  function update(field: keyof EnquiryState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setError('Enter a 10-digit mobile number.');
      return;
    }
    if (
      form.minBudget &&
      form.maxBudget &&
      Number(form.minBudget) > Number(form.maxBudget)
    ) {
      setError('Minimum budget should be lower than the maximum.');
      return;
    }
    if (form.minYear && form.maxYear && Number(form.minYear) > Number(form.maxYear)) {
      setError('Minimum year should be earlier than the maximum year.');
      return;
    }
    setError('');
    setSaved(form);
  }

  const formCard = (
      <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
        <form className={styles.form} onSubmit={onSubmit} aria-label="Car enquiry">
          <div className={`${styles.row} ${styles.span4}`}>
            <label>
              Name <span>*</span>
              <input
                name="name"
                autoComplete="name"
                required
                placeholder="Your name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
              />
            </label>
            <label>
              Mobile number <span>*</span>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={(event) => update('mobile', event.target.value)}
              />
            </label>
          </div>

          <fieldset className={`${styles.group} ${styles.span2}`}>
            <legend>
              Budget range <span>*</span>
            </legend>
            <div className={styles.row}>
              <label>
                <span className="sr-only">Minimum budget</span>
                <select
                  required
                  value={form.minBudget}
                  onChange={(event) => update('minBudget', event.target.value)}
                >
                  <option value="">Min. budget</option>
                  {BUDGETS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Maximum budget</span>
                <select
                  required
                  value={form.maxBudget}
                  onChange={(event) => update('maxBudget', event.target.value)}
                >
                  <option value="">Max. budget</option>
                  {BUDGETS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className={`${styles.group} ${styles.span2}`}>
            <legend>
              Car year <span>*</span>
            </legend>
            <div className={styles.row}>
              <label>
                <span className="sr-only">Minimum year</span>
                <select
                  required
                  value={form.minYear}
                  onChange={(event) => update('minYear', event.target.value)}
                >
                  <option value="">Min. year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Maximum year</span>
                <select
                  required
                  value={form.maxYear}
                  onChange={(event) => update('maxYear', event.target.value)}
                >
                  <option value="">Max. year</option>
                  {YEARS.map((year) => (
                    <option key={`max-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <label className={styles.modelField}>
            Model <span>*</span>
            <input
              name="model"
              required
              placeholder="e.g. Hyundai Creta"
              value={form.model}
              onChange={(event) => update('model', event.target.value)}
            />
          </label>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.footer}>
            <button type="submit" className={styles.submit}>
              Send details
            </button>
          </div>

          {saved ? (
            <p className={styles.success} role="status">
              Thanks {saved.name}. We noted {saved.model} for{' '}
              {saved.mobile}. Call 088888 85076 if you want to speak with the
              Kondhwa showroom now.
            </p>
          ) : null}
        </form>
      </div>
  );

  if (compact) {
    return formCard;
  }

  return (
    <section className={styles.section} aria-label="Car enquiry">
      <div className="container">{formCard}</div>
    </section>
  );
}
