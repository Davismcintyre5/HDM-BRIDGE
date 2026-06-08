import HeroSection from '../../components/landing/HeroSection';
import FeatureCards from '../../components/landing/FeatureCards';
import PricingSection from '../../components/landing/PricingSection';
import ChatWidget from '../../components/landing/ChatWidget';

export default function Landing() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <PricingSection />
      <ChatWidget />
    </>
  );
}