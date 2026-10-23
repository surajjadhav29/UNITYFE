import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CrmSideSheet } from './CrmSideSheet';
import type { Lead, StockVehicle } from '../types/crm.types';
import { formatINR, formatKilometres } from '../../utils/format';
import {
  buildShortVehicleShareMessage,
  getVehicleShareImages,
  isValidLeadMobile,
  shareVehicleToLeadWhatsApp,
} from '../utils/whatsappShare';

interface ShareStockWhatsAppSheetProps {
  open: boolean;
  lead: Lead | null;
  vehicles: StockVehicle[];
  onClose: () => void;
  onShared: (leadId: string, vehicleId: string) => void;
}

export function ShareStockWhatsAppSheet({
  open,
  lead,
  vehicles,
  onClose,
  onShared,
}: ShareStockWhatsAppSheetProps) {
  const [query, setQuery] = useState('');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareHint, setShareHint] = useState('');

  const shopStock = useMemo(
    () =>
      vehicles.filter(
        (v) => v.showOnWebsite && (v.availability === 'Available' || v.availability === 'Reserved'),
      ),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shopStock;
    return shopStock.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q),
    );
  }, [shopStock, query]);

  const picked = pickedId ? vehicles.find((v) => v.id === pickedId) : undefined;
  const previewPaths = picked
    ? getVehicleShareImages(picked).map((url) => {
        try {
          const u = new URL(url);
          return u.pathname;
        } catch {
          return picked.image;
        }
      })
    : [];

  async function onShare() {
    if (!lead || !picked) return;
    if (!isValidLeadMobile(lead.mobile)) {
      window.alert('This lead does not have a valid 10-digit WhatsApp mobile number.');
      return;
    }
    setSharing(true);
    setShareHint('');
    try {
      const mode = await shareVehicleToLeadWhatsApp(lead.mobile, picked);
      onShared(lead.id, picked.id);
      setShareHint(
        mode === 'native-files'
          ? 'Shared 2 photos + short message (pick WhatsApp in the share menu if asked).'
          : 'WhatsApp opened with short message and 2 photo links (desktop fallback).',
      );
      setPickedId(null);
      setQuery('');
      onClose();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setShareHint('Could not share. Try again or use lead detail page.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <CrmSideSheet
      open={open && Boolean(lead)}
      title="Share shop car on WhatsApp"
      onClose={() => {
        setPickedId(null);
        setQuery('');
        setShareHint('');
        onClose();
      }}
      footer={
        <>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="crm-btn crm-btn-whatsapp"
            disabled={!pickedId || sharing}
            onClick={onShare}
          >
            <MessageCircle size={18} aria-hidden />
            {sharing ? 'Preparing…' : 'Share 2 photos + message'}
          </button>
        </>
      }
    >
      {lead ? (
        <>
          <p className="crm-contact-intro">
            To <strong>{lead.customerName}</strong> · {lead.mobile}. We send a <strong>short message</strong>{' '}
            plus <strong>2 images</strong> (front &amp; side). On mobile, photos attach when your browser
            supports share; on desktop, WhatsApp opens with message + photo links.
          </p>
          {shareHint ? <div className="crm-alert crm-alert-success">{shareHint}</div> : null}
          <input
            className="crm-stock-search"
            placeholder="Search shop stock"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search shop stock"
          />
          <div className="crm-shop-grid">
            {filtered.map((v) => {
              const selected = pickedId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`crm-shop-card${selected ? ' crm-shop-card-selected' : ''}`}
                  onClick={() => setPickedId(v.id)}
                >
                  <img src={v.image} alt="" className="crm-shop-card-img" />
                  <div className="crm-shop-card-body">
                    <strong>
                      {v.brand} {v.model}
                    </strong>
                    <span>{formatINR(v.sellingPrice)}</span>
                    <span>
                      {v.year} · {formatKilometres(v.kilometres)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {picked ? (
            <div className="crm-share-preview">
              <p className="crm-share-preview-title">Message preview</p>
              <pre className="crm-share-preview-text">{buildShortVehicleShareMessage(picked)}</pre>
              <p className="crm-share-preview-title">Photos to send (2)</p>
              <div className="crm-share-preview-images">
                {previewPaths.map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
              </div>
            </div>
          ) : null}
          {filtered.length === 0 ? (
            <p className="crm-empty">No shop-visible cars. Mark stock as &quot;Show on website&quot;.</p>
          ) : null}
        </>
      ) : null}
    </CrmSideSheet>
  );
}
