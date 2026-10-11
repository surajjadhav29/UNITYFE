import { useEffect, useRef, useState } from 'react';
import styles from './StatsBar.module.css';

const STATS = [
  { target: 9400, label: 'Cars purchased' },
  { target: 8400, label: 'Happy clients' },
  { target: 14, label: 'Years experience' },
] as const;

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      return;
    }

    const duration = 1600;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

function CountFigure({ target, active }: { target: number; active: boolean }) {
  const value = useCountUp(target, active);

  return (
    <strong>
      {value.toLocaleString('en-IN')}+
    </strong>
  );
}

export function StatsBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.bar} aria-label="Unity Motors figures">
      <ul className={`container ${styles.stats}`}>
        {STATS.map((item) => (
          <li key={item.label}>
            <CountFigure target={item.target} active={active} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
