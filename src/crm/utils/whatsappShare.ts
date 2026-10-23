import { BUSINESS } from '../../data/business';
import type { StockVehicle } from '../types/crm.types';
import { formatINR, formatKilometres } from '../../utils/format';

function normalizeWhatsAppMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  return digits;
}

function toAbsoluteUrl(path: string, origin: string): string {
  if (path.startsWith('http')) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** First two photos used when sharing (front + side), same as the public car page. */
export function getVehicleShareImages(
  vehicle: StockVehicle,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string[] {
  const paths =
    vehicle.gallery && vehicle.gallery.length >= 2
      ? vehicle.gallery.slice(0, 2)
      : [vehicle.image, vehicle.image.replace(/\.(jpe?g|webp|png)$/i, '-side.$1')];

  return paths.map((p) => toAbsoluteUrl(p, origin));
}

/** Short WhatsApp-friendly message (wa.me cannot attach files — kept brief). */
export function buildShortVehicleShareMessage(vehicle: StockVehicle): string {
  return [
    `Hi! ${BUSINESS.name} 🚗`,
    '',
    `*${vehicle.year} ${vehicle.brand} ${vehicle.model}*`,
    `${formatINR(vehicle.sellingPrice)} · ${formatKilometres(vehicle.kilometres)} · ${vehicle.fuelType} · ${vehicle.transmission}`,
    '',
    `📍 ${BUSINESS.address}`,
    `📞 ${BUSINESS.phoneDisplay}`,
  ].join('\n');
}

/** Longer message with description (lead detail page). */
export function buildVehicleShareMessage(
  vehicle: StockVehicle,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  const urls = getVehicleShareImages(vehicle, origin);
  return [
    buildShortVehicleShareMessage(vehicle),
    '',
    vehicle.description,
    '',
    '📷 Photos:',
    urls[0],
    urls[1] ?? urls[0],
  ].join('\n');
}

export function openWhatsAppToLead(leadMobile: string, message: string): void {
  const phone = normalizeWhatsAppMobile(leadMobile);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export type VehicleWhatsAppShareMode = 'native-files' | 'whatsapp-text';

/**
 * Best effort: on many phones, shares 2 image files + short text via the system share sheet.
 * Desktop / unsupported browsers: opens WhatsApp with short text + 2 photo links.
 */
export async function shareVehicleToLeadWhatsApp(
  leadMobile: string,
  vehicle: StockVehicle,
): Promise<VehicleWhatsAppShareMode> {
  const origin = window.location.origin;
  const message = buildShortVehicleShareMessage(vehicle);
  const imageUrls = getVehicleShareImages(vehicle, origin);

  try {
    const files: File[] = [];
    for (let i = 0; i < Math.min(2, imageUrls.length); i++) {
      const res = await fetch(imageUrls[i]);
      if (!res.ok) continue;
      const blob = await res.blob();
      files.push(
        new File([blob], `unity-${vehicle.id}-${i + 1}.jpg`, {
          type: blob.type || 'image/jpeg',
        }),
      );
    }

    if (
      files.length >= 2 &&
      typeof navigator.share === 'function' &&
      (!navigator.canShare || navigator.canShare({ files, text: message }))
    ) {
      await navigator.share({ text: message, files });
      return 'native-files';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
  }

  const fallback = [
    message,
    '',
    '📷 Photo 1:',
    imageUrls[0],
    '',
    '📷 Photo 2:',
    imageUrls[1] ?? imageUrls[0],
  ].join('\n');

  openWhatsAppToLead(leadMobile, fallback);
  return 'whatsapp-text';
}

export function isValidLeadMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\D/g, '').slice(-10));
}
