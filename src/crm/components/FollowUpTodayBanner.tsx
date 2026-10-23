import { Link } from 'react-router-dom';
import { AlertCircle, CalendarClock, Phone } from 'lucide-react';
import type { DueFollowUpItem } from '../utils/followUpDue';

interface FollowUpTodayBannerProps {
  today: DueFollowUpItem[];
  overdue: DueFollowUpItem[];
}

export function FollowUpTodayBanner({ today, overdue }: FollowUpTodayBannerProps) {
  if (today.length === 0 && overdue.length === 0) return null;

  return (
    <div className="crm-today-banner">
      {overdue.length > 0 ? (
        <div className="crm-today-block crm-today-overdue">
          <div className="crm-today-head">
            <AlertCircle size={18} aria-hidden />
            <strong>Overdue — call now ({overdue.length})</strong>
          </div>
          <ul className="crm-today-list">
            {overdue.slice(0, 5).map(({ followUp, lead }) => (
              <li key={followUp.id}>
                <Link to={`/admin/leads/${lead.id}`}>
                  {lead.customerName} · {followUp.type}
                </Link>
                <span>{lead.mobile}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {today.length > 0 ? (
        <div className="crm-today-block crm-today-due">
          <div className="crm-today-head">
            <CalendarClock size={18} aria-hidden />
            <strong>Today&apos;s follow-ups ({today.length})</strong>
          </div>
          <p className="crm-today-hint">
            <Phone size={14} aria-hidden /> These customers expect a call or message today.
          </p>
          <ul className="crm-today-list">
            {today.slice(0, 6).map(({ followUp, lead }) => (
              <li key={followUp.id}>
                <Link to={`/admin/leads/${lead.id}`}>
                  {lead.customerName} · {followUp.type}
                </Link>
                <span>
                  {new Date(followUp.scheduledAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
