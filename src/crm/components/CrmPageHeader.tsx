import type { ReactNode } from 'react';

interface CrmPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: string[];
}

export function CrmPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: CrmPageHeaderProps) {
  return (
    <header className="crm-page-header">
      <div className="crm-page-header-text">
        {breadcrumbs?.length ? (
          <p className="crm-page-breadcrumbs">{breadcrumbs.join(' · ')}</p>
        ) : null}
        <h1>{title}</h1>
        {description ? <p className="crm-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="crm-page-header-actions">{actions}</div> : null}
    </header>
  );
}
