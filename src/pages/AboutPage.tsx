import { About } from '../components/About/About';
import { AboutStories } from '../components/AboutStories/AboutStories';
import { CTA } from '../components/CTA/CTA';
import { PageIntro } from '../components/PageIntro/PageIntro';
import { WhyChooseUs } from '../components/WhyChooseUs/WhyChooseUs';

export function AboutPage() {
  return (
    <>
      <PageIntro
        title="About Us"
        text="Unity Auto Solution is listed on Google as a used-car dealer at Shreehans Nagar, Kondhwa, Pune. This page uses that public address, phone, hours, and showroom photo."
      />
      <About />
      <AboutStories />
      <WhyChooseUs />
      <CTA />
    </>
  );
}