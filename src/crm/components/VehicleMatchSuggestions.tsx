import { Link } from 'react-router-dom';
import type { Lead, StockVehicle } from '../types/crm.types';
import { formatINR, formatKilometres } from '../../utils/format';
import { matchVehiclesForLead } from '../utils/leadInsights';

interface VehicleMatchSuggestionsProps {
  lead: Lead;
  vehicles: StockVehicle[];
  onSelect: (vehicleId: string) => void;
}

export function VehicleMatchSuggestions({
  lead,
  vehicles,
  onSelect,
}: VehicleMatchSuggestionsProps) {
  const matches = matchVehiclesForLead(lead, vehicles);

  if (matches.length === 0) {
    return (
      <p className="crm-empty" style={{ padding: '1rem 0' }}>
        No strong stock match — adjust budget or preferences, or browse{' '}
        <Link to="/admin/vehicles">Stock</Link>.
      </p>
    );
  }

  return (
    <ul className="crm-match-list">
      {matches.map((v) => (
        <li key={v.id} className="crm-match-item">
          <img src={v.image} alt="" className="crm-match-thumb" />
          <div className="crm-match-body">
            <strong>
              {v.year} {v.brand} {v.model}
            </strong>
            <span className="crm-match-meta">
              {formatINR(v.sellingPrice)} · {formatKilometres(v.kilometres)} · {v.fuelType}
            </span>
          </div>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => onSelect(v.id)}>
            Link to lead
          </button>
        </li>
      ))}
    </ul>
  );
}
