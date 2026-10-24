import { CrmTable } from '../../common/components/CrmTable';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export type TeamWorkloadRow = {
  id: string;
  name: string;
  role: string;
  leads: number;
  followUps: number;
  appts: number;
  sales: number;
};

interface TeamWorkloadTableProps {
  rows: TeamWorkloadRow[];
}

export function TeamWorkloadTable({ rows }: TeamWorkloadTableProps) {
  if (rows.length === 0) {
    return <p className="dn-empty">No team members to show.</p>;
  }

  return (
    <CrmTable variant="embedded" wrapClassName="dn-team-workload-table" stickyHeader>
        <thead>
          <tr>
            <th className="dn-col-member">Team member</th>
            <th className="dn-col-num">Open enquiries</th>
            <th className="dn-col-num">Callbacks</th>
            <th className="dn-col-num">Meetings</th>
            <th className="dn-col-num">Cars sold</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="dn-col-member">
                <div className="dn-member-cell">
                  <span className="dn-member-avatar" aria-hidden>
                    {initials(r.name)}
                  </span>
                  <div className="dn-member-text">
                    <strong>{r.name}</strong>
                    <span>{r.role}</span>
                  </div>
                </div>
              </td>
              <td className="dn-col-num">
                <span className="dn-metric-pill">{r.leads}</span>
              </td>
              <td className="dn-col-num">
                <span className="dn-metric-pill">{r.followUps}</span>
              </td>
              <td className="dn-col-num">
                <span className="dn-metric-pill">{r.appts}</span>
              </td>
              <td className="dn-col-num">
                <span className={`dn-metric-pill${r.sales > 0 ? ' dn-metric-pill-accent' : ''}`}>
                  {r.sales}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
    </CrmTable>
  );
}
