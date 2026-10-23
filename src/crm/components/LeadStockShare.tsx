import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Lead, StockVehicle } from '../types/crm.types';
import { formatINR, formatKilometres } from '../../utils/format';
import {
  isValidLeadMobile,
  shareVehicleToLeadWhatsApp,
} from '../utils/whatsappShare';

interface LeadStockShareProps {
  lead: Lead;
  vehicles: StockVehicle[];
  onLinkVehicle: (vehicleId: string) => void;
}

export function LeadStockShare({ lead, vehicles, onLinkVehicle }: LeadStockShareProps) {
  const [query, setQuery] = useState('');

  const available = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          v.availability === 'Available' ||
          v.availability === 'Reserved' ||
          v.id === lead.interestedVehicleId,
      ),
    [vehicles, lead.interestedVehicleId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q),
    );
  }, [available, query]);

  async function shareOnWhatsApp(vehicle: StockVehicle) {
    if (!isValidLeadMobile(lead.mobile)) {
      window.alert('Valid 10-digit mobile required for WhatsApp.');
      return;
    }
    try {
      await shareVehicleToLeadWhatsApp(lead.mobile, vehicle);
      onLinkVehicle(vehicle.id);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
  }

  return (
    <div className="crm-stock-share">
      <p className="crm-contact-intro">
        Send to <strong>{lead.customerName}</strong>: short message + <strong>2 photos</strong>{' '}
        (front &amp; side from stock).
      </p>
      <input
        className="crm-stock-search"
        placeholder="Search stock by brand or model"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search stock"
      />
      <ul className="crm-stock-list">
        {filtered.map((v) => (
          <li key={v.id} className="crm-stock-item">
            <img src={v.image} alt="" className="crm-stock-thumb" />
            <div className="crm-stock-info">
              <strong>
                {v.brand} {v.model}
              </strong>
              <span>
                {v.year} · {formatKilometres(v.kilometres)} · {formatINR(v.sellingPrice)}
              </span>
              {lead.interestedVehicleId === v.id ? (
                <span className="crm-stock-linked">Linked to this lead</span>
              ) : null}
            </div>
            <button
              type="button"
              className="crm-btn crm-btn-whatsapp"
              onClick={() => shareOnWhatsApp(v)}
              title={`WhatsApp ${lead.customerName}`}
            >
              <MessageCircle size={18} aria-hidden />
              WhatsApp
            </button>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? <p className="crm-empty">No matching vehicles in stock.</p> : null}
    </div>
  );
}
