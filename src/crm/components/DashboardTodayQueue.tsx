import { Link } from 'react-router-dom';
import { CrmTable } from '../common/components/CrmTable';
import { AlertCircle, MessageCircle, Phone } from 'lucide-react';
import type { NeedsAttentionItem } from '../utils/leadInsights';
import { attentionReasonLabel } from '../utils/leadInsights';
import type { DueFollowUpItem } from '../utils/followUpDue';

interface DashboardTodayQueueProps {
  attention: NeedsAttentionItem[];
  dueToday: DueFollowUpItem[];
  overdue: DueFollowUpItem[];
}

type QueueRow = {
  id: string;
  leadId: string;
  name: string;
  mobile: string;
  reason: string;
  tone: 'danger' | 'warning' | 'neutral';
};

export function DashboardTodayQueue({
  attention,
  dueToday,
  overdue,
}: DashboardTodayQueueProps) {
  const rows: QueueRow[] = [];

  for (const { followUp, lead } of overdue) {
    rows.push({
      id: `fu-${followUp.id}`,
      leadId: lead.id,
      name: lead.customerName,
      mobile: lead.mobile,
      reason: `Overdue · ${followUp.type}`,
      tone: 'danger',
    });
  }

  for (const item of attention) {
    if (rows.some((r) => r.leadId === item.lead.id)) continue;
    rows.push({
      id: `att-${item.lead.id}`,
      leadId: item.lead.id,
      name: item.lead.customerName,
      mobile: item.lead.mobile,
      reason: attentionReasonLabel(item.reasons[0]),
      tone: item.reasons.includes('overdue_follow_up') ? 'danger' : 'warning',
    });
  }

  for (const { followUp, lead } of dueToday) {
    if (rows.some((r) => r.leadId === lead.id)) continue;
    rows.push({
      id: `today-${followUp.id}`,
      leadId: lead.id,
      name: lead.customerName,
      mobile: lead.mobile,
      reason: `Due today · ${followUp.type}`,
      tone: 'warning',
    });
  }

  if (rows.length === 0) {
    return (
      <section className="crm-dash-queue crm-dash-queue-empty">
        <h2 className="crm-dash-queue-title">Today&apos;s queue</h2>
        <p>All caught up — no overdue or priority leads right now.</p>
        <Link to="/admin/leads/new" className="crm-btn crm-btn-primary">
          Add new lead
        </Link>
      </section>
    );
  }

  return (
    <section className="crm-dash-queue">
      <div className="crm-dash-queue-head">
        <h2 className="crm-dash-queue-title">Today&apos;s queue</h2>
        <span className="crm-dash-queue-count">{rows.length} to work</span>
      </div>
      <p className="crm-dash-queue-sub">
        Who to contact first — based on overdue follow-ups and dealer CRM priority rules.
      </p>
      <CrmTable variant="embedded" wrapClassName="crm-dash-queue-table-wrap" stickyHeader>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((row) => (
              <tr key={row.id}>
                <td>
                  <Link to={`/admin/leads/${row.leadId}`} className="crm-dash-queue-name">
                    {row.name}
                  </Link>
                  <span className="crm-dash-queue-mobile">{row.mobile}</span>
                </td>
                <td>
                  <span className={`crm-dash-reason crm-dash-reason-${row.tone}`}>
                    {row.tone === 'danger' ? <AlertCircle size={14} aria-hidden /> : null}
                    {row.reason}
                  </span>
                </td>
                <td>
                  <div className="crm-dash-queue-actions">
                    <a
                      href={`tel:${row.mobile}`}
                      className="crm-dash-action-btn"
                      title="Call"
                    >
                      <Phone size={16} aria-hidden />
                    </a>
                    <a
                      href={`https://wa.me/91${row.mobile.replace(/\D/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="crm-dash-action-btn crm-dash-action-wa"
                      title="WhatsApp"
                    >
                      <MessageCircle size={16} aria-hidden />
                    </a>
                    <Link to={`/admin/leads/${row.leadId}`} className="crm-dash-action-link">
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
      </CrmTable>
      <Link to="/admin/follow-ups" className="crm-link crm-dash-queue-more">
        View all follow-ups →
      </Link>
    </section>
  );
}
