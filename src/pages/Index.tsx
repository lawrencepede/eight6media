import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import DifferentiatorsSection from "@/components/DifferentiatorsSection";
import FeaturedCreatorSection from "@/components/FeaturedCreatorSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <DifferentiatorsSection />
      <FeaturedCreatorSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
