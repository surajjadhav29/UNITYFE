import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

export function Accordion({
  title,
  count = 0,
  open,
  onToggle,
  children,
  className,
}: {
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('ld-filter-accordion', open && 'is-open', className)}>
      <button
        type="button"
        className="ld-filter-accordion-head"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="ld-filter-accordion-title">{title}</span>
        {count > 0 ? <span className="ld-filter-accordion-count">{count}</span> : <span aria-hidden />}
        <ChevronDown size={17} aria-hidden className="ld-filter-accordion-chevron" />
      </button>
      {open ? <div className="ld-filter-accordion-body">{children}</div> : null}
    </section>
  );
}
