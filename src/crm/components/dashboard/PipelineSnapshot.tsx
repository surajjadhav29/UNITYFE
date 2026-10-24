import type { Lead } from '../../types/crm.types';

interface PipelineSnapshotProps {
  leads: Lead[];
}

export function PipelineSnapshot({ leads }: PipelineSnapshotProps) {
  const won = leads.filter((l) => l.status === 'Won').length;
  const lost = leads.filter((l) => l.status === 'Lost').length;
  const open = leads.filter((l) => !['Won', 'Lost'].includes(l.status));
  const newCount = open.filter((l) => l.status === 'New').length;
  const inProgress = open.length - newCount;
  const total = leads.length || 1;

  const rows = [
    {
      label: 'New — not contacted yet',
      value: newCount,
      color: '#3b82f6',
    },
    {
      label: 'In progress — calls, visits & negotiation',
      value: inProgress,
      color: '#6366f1',
    },
    {
      label: 'Won — sale completed',
      value: won,
      color: '#22c55e',
    },
    {
      label: 'Lost — customer did not buy',
      value: lost,
      color: '#94a3b8',
    },
  ];

  return (
    <div className="dn-pipeline-snapshot">
      <p className="dn-section-desc">
        Where all your enquiries stand <strong>right now</strong> (not filtered by date above).
      </p>
      <ul className="dn-pipeline-bars">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="dn-pipeline-bar-head">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
            <div className="dn-pipeline-bar-track">
              <div
                className="dn-pipeline-bar-fill"
                style={{
                  width: `${Math.max(row.value > 0 ? 4 : 0, (row.value / total) * 100)}%`,
                  background: row.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="dn-pipeline-foot">
        <strong>{open.length}</strong> customers still in your pipeline ·{' '}
        <strong>{won}</strong> cars sold from CRM leads
      </p>
    </div>
  );
}
