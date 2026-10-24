import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

/** Right filter rail — uses `crm-leads.css` layout (fixed foot, scroll body). */
export function SideRail({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  ariaLabel,
  className,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <aside
      aria-label={ariaLabel ?? title}
      aria-hidden={!open}
      className={cn('ld-filters-rail', open && 'is-open', className)}
    >
      <header className="ld-filters-rail-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <button
          type="button"
          className="ld-filters-rail-close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="ld-filters-rail-body">{children}</div>
      <footer className="ld-filters-rail-foot">{footer}</footer>
    </aside>
  );
}
