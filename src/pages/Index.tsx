import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import DifferentiatorsSection from "@/components/DifferentiatorsSection";
import ApproachSection from "@/components/ApproachSection";
import ProofSection from "@/components/ProofSection";
import PortfolioSection from "@/components/PortfolioSection";
import TalentSection from "@/components/TalentSection";
import ForBrandsSection from "@/components/ForBrandsSection";
import ForCreatorsSection from "@/components/ForCreatorsSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <DifferentiatorsSection />
      <ApproachSection />
      <ProofSection />
      <PortfolioSection />
      <TalentSection />
      <ForBrandsSection />
      <ForCreatorsSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
