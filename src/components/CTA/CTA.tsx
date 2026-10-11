import { Link } from 'react-router-dom';
import styles from './CTA.module.css';

export function CTA() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className="container">
        <div className={styles.banner}>
          <div>
            <h2 id="cta-heading">Ready to talk about a used car?</h2>
            <p>
              Visit the Kondhwa showroom or share your car details on the sell
              page.
            </p>
          </div>
          <Link className={styles.button} to="/sell">
            Sell Your Car
          </Link>
        </div>
      </div>
    </section>
  );
}
