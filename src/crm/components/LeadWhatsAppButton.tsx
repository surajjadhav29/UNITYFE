import { MessageCircle } from 'lucide-react';
import type { SyntheticEvent } from 'react';

interface LeadWhatsAppButtonProps {
  label: string;
  onClick: () => void;
  stopDrag?: boolean;
}

export function LeadWhatsAppButton({ label, onClick, stopDrag = false }: LeadWhatsAppButtonProps) {
  function blockDrag(event: SyntheticEvent) {
    if (stopDrag) event.stopPropagation();
  }

  return (
    <button
      type="button"
      className="crm-wa-icon-btn"
      aria-label={label}
      title="Share shop car on WhatsApp"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={blockDrag}
      onPointerDown={blockDrag}
    >
      <MessageCircle size={18} aria-hidden />
    </button>
  );
}
