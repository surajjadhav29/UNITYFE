import { AvailableCars } from '../components/AvailableCars/AvailableCars';
import { CTA } from '../components/CTA/CTA';

export function BrowsePage() {
  return (
    <>
      <AvailableCars
        heading="Browse Cars"
        subtitle="Filter owner listings in Pune by body type and sort by asking price."
      />
      <CTA />
    </>
  );
}
