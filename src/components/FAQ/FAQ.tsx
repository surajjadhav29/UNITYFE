import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { BUSINESS } from '../../data/business';
import styles from './FAQ.module.css';

const QUESTIONS = [
  {
    q: 'Where is Unity Auto Solution?',
    a: `${BUSINESS.address}. Plus code ${BUSINESS.plusCode}.`,
  },
  {
    q: 'What are the showroom hours?',
    a: `The Google listing shows ${BUSINESS.hours}. ${BUSINESS.hoursNote}`,
  },
  {
    q: 'Which areas around Pune do you mention?',
    a: `The public listing names ${BUSINESS.areas.join(', ')}, and nearby parts of Pune.`,
  },
  {
    q: 'How do I ask about a car?',
    a: `Call ${BUSINESS.phoneDisplay} or use the contact form. This website does not send messages to a server.`,
  },
  {
    q: 'Can I share a car I want to sell?',
    a: 'Open Sell Your Car and fill in the form. It stays in the browser and is not sent to a server.',
  },
] as const;

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <div className="container">
        <h2 id="faq-heading">Questions about cars in Kondhwa</h2>
        <div className={styles.list}>
          {QUESTIONS.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className={styles.item}>
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  {item.q}
                  <ChevronDown
                    size={18}
                    className={expanded ? styles.chevronOpen : styles.chevron}
                    aria-hidden="true"
                  />
                </button>
                {expanded ? <p className={styles.answer}>{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
