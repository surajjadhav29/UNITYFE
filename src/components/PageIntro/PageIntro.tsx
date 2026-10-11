import styles from './PageIntro.module.css';

interface PageIntroProps {
  title: string;
  text: string;
}

export function PageIntro({ title, text }: PageIntroProps) {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
