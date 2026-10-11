import { BUSINESS } from '../../data/business';
import styles from './WhatsAppButton.module.css';

function WhatsAppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10.1 10.1 0 0 0 4.65 1.12h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.76 13.95c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.37.26-.28.57-.35.76-.35h.55c.17 0 .41-.06.64.49.24.57.81 1.97.88 2.11.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.13-.28.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.26.13.42.11.57-.07.16-.17.66-.77.84-1.03.17-.26.35-.22.58-.13.24.09 1.5.71 1.76.84.26.13.43.19.49.3.07.11.07.64-.17 1.32Z"
      />
    </svg>
  );
}

export function WhatsAppButton() {
  return (
    <a
      className={styles.button}
      href={BUSINESS.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Unity Motors on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
