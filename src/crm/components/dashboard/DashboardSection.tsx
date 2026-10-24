import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  leading?: ReactNode;
}

export function DashboardSection({
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = 'Open full list →',
  children,
  className = '',
  bodyClassName = '',
  leading,
}: DashboardSectionProps) {
  return (
    <section className={`dn-card ${className}`.trim()}>
      <header className="dn-card-head">
        {leading ? <div className="dn-card-head-leading">{leading}</div> : null}
        <div className="dn-card-head-titles">
          <h2 className="dn-card-head-title">{title}</h2>
          {subtitle ? <p className="dn-card-head-sub">{subtitle}</p> : null}
        </div>
        {viewAllTo ? (
          <Link to={viewAllTo} className="dn-view-all">
            {viewAllLabel}
          </Link>
        ) : null}
      </header>
      <div className={`dn-card-body${bodyClassName ? ` ${bodyClassName}` : ''}`.trim()}>{children}</div>
    </section>
  );
}
