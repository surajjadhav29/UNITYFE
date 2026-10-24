interface StockAtAGlanceProps {
  available: number;
  reserved: number;
  sold: number;
  oldestDays: number;
}

export function StockAtAGlance({ available, reserved, sold, oldestDays }: StockAtAGlanceProps) {
  const total = available + reserved + sold;

  return (
    <div className="dn-stock-glance">
      <p className="dn-section-desc">
        Cars in your showroom stock today — how many you can sell vs already reserved or sold.
      </p>
      <div className="dn-stock-glance-grid">
        <div className="dn-stock-glance-item dn-stock-glance-ok">
          <strong>{available}</strong>
          <span>Ready to sell</span>
        </div>
        <div className="dn-stock-glance-item dn-stock-glance-warn">
          <strong>{reserved}</strong>
          <span>Reserved for a buyer</span>
        </div>
        <div className="dn-stock-glance-item">
          <strong>{sold}</strong>
          <span>Marked sold</span>
        </div>
      </div>
      <p className="dn-pipeline-foot">
        <strong>{total}</strong> vehicles in system
        {available > 0 ? (
          <>
            {' '}
            · oldest unsold unit listed <strong>{oldestDays}</strong> days ago
          </>
        ) : null}
      </p>
    </div>
  );
}
