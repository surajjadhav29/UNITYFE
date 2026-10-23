import { About } from '../components/About/About';
import { AvailableCars } from '../components/AvailableCars/AvailableCars';
import { CTA } from '../components/CTA/CTA';
import { FAQ } from '../components/FAQ/FAQ';
import { HeroBanner } from '../components/HeroBanner/HeroBanner';
import { StatsBar } from '../components/StatsBar/StatsBar';
import { TrustSection } from '../components/TrustSection/TrustSection';
import { LocalInfo } from '../components/LocalInfo/LocalInfo';
import { WhyChooseUs } from '../components/WhyChooseUs/WhyChooseUs';

export function HomePage() {
  return (
    <>
      <HeroBanner />
      <About />
      <StatsBar />
      <AvailableCars />
      <TrustSection />
      <WhyChooseUs />
      <FAQ />
      <LocalInfo />
      <CTA />
    </>
  );
}
