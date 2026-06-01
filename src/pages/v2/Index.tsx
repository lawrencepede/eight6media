import HeroSection from "@/components/v2/HeroSection";
import MarqueeSection from "@/components/v2/MarqueeSection";
import ManifestoSection from "@/components/v2/ManifestoSection";
import ServicesSection from "@/components/v2/ServicesSection";
import AboutPreview from "@/components/v2/AboutPreview";
import CTASection from "@/components/v2/CTASection";
import Footer from "@/components/v2/Footer";

const Index = () => (
  <div className="v2-root" style={{ minHeight: "100svh" }}>
    <HeroSection />
    <MarqueeSection />
    <ManifestoSection />
    <ServicesSection />
    <AboutPreview />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
