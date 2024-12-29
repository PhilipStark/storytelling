import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/sections/Hero';
import { Features } from '../components/sections/Features';
import { Examples } from '../components/sections/Examples';
import { Pricing } from '../components/sections/Pricing';
import { Testimonials } from '../components/sections/Testimonials';
import { Footer } from '../components/sections/Footer';

export function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Examples />
      <Pricing />
      <Testimonials />
      <Footer />
    </>
  );
}