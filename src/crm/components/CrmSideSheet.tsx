import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface CrmSideSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function CrmSideSheet({ open, title, onClose, children, footer }: CrmSideSheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="crm-sheet-root" role="presentation">
      <button type="button" className="crm-sheet-backdrop" aria-label="Close filters" onClick={onClose} />
      <aside
        className="crm-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-sheet-title"
      >
        <header className="crm-sheet-header">
          <h2 id="crm-sheet-title" className="crm-sheet-title">
            {title}
          </h2>
          <button type="button" className="crm-sheet-close" onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden />
          </button>
        </header>
        <div className="crm-sheet-body">{children}</div>
        {footer ? <footer className="crm-sheet-footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}
