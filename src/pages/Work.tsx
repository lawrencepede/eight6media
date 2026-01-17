import Navigation from "@/components/Navigation";
import PortfolioSection from "@/components/PortfolioSection";
import Footer from "@/components/Footer";

const Work = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-20">
        <PortfolioSection />
      </div>
      <Footer />
    </div>
  );
};

export default Work;
